// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {AppBinding, AppCall, AppCallResponse} from 'mattermost-redux/types/apps';
import {ActionResult} from 'mattermost-redux/types/actions';
import {AppBindingLocations, AppCallResponseTypes, AppExpandLevels} from 'mattermost-redux/constants/apps';
import {Post} from 'mattermost-redux/types/posts';

import {injectIntl, IntlShape} from 'react-intl';

import Markdown from 'components/markdown';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';
import {createCallRequest} from 'utils/apps';
import {sendEphemeralPost} from 'actions/global_actions';

type Props = {
    intl: IntlShape;
    binding: AppBinding;
    userId: string;
    post: Post;
    actions: {
        doAppCall: (call: AppCall) => Promise<ActionResult>;
    };
}

type State = {
    executing: boolean;
}

class ButtonBinding extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            executing: false,
        };
    }

    handleClick = async () => {
        const {binding, post, userId} = this.props;
        if (!binding.call) {
            return;
        }

        const call = createCallRequest(
            binding.call,
            userId,
            binding.app_id,
            AppBindingLocations.IN_POST + '/' + binding.location,
            {post: AppExpandLevels.EXPAND_ALL},
            post.channel_id,
            post.id,
        );
        this.setState({executing: true});
        const res = await this.props.actions.doAppCall(call);

        this.setState({executing: false});
        const callResp = (res as {data: AppCallResponse}).data;
        const ephemeral = (message: string) => sendEphemeralPost(message, this.props.post.channel_id, this.props.post.root_id);
        switch (callResp.type) {
        case AppCallResponseTypes.OK:
            if (callResp.markdown) {
                ephemeral(callResp.markdown);
            }
            break;
        case AppCallResponseTypes.ERROR: {
            const errorMessage = callResp.error || this.props.intl.formatMessage({id: 'apps.error.unknown', defaultMessage: 'Unknown error happenned'});
            ephemeral(errorMessage);
            break;
        }
        case AppCallResponseTypes.NAVIGATE:
        case AppCallResponseTypes.FORM:
            break;
        default: {
            const errorMessage = this.props.intl.formatMessage(
                {id: 'apps.error.responses.unknown_type', defaultMessage: 'App response type not supported. Response type: {type}.'},
                {type: callResp.type},
            );
            ephemeral(errorMessage);
        }
        }
    }

    render() {
        const {binding} = this.props;
        let customButtonStyle;

        if (!binding.call) {
            return null;
        }

        return (
            <button
                key={binding.location}
                onClick={this.handleClick}
                style={customButtonStyle}
            >
                <LoadingWrapper
                    loading={this.state.executing}
                >
                    <Markdown
                        message={binding.label}
                        options={{
                            mentionHighlight: false,
                            markdown: false,
                            autolinkedUrlSchemes: [],
                        }}
                    />
                </LoadingWrapper>
            </button>
        );
    }
}

export default injectIntl(ButtonBinding);
