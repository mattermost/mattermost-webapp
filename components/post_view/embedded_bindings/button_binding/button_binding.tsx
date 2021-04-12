// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {injectIntl, IntlShape} from 'react-intl';

import {AppBinding, AppCallRequest, AppCallResponse, AppCallType} from 'mattermost-redux/types/apps';
import {ActionResult} from 'mattermost-redux/types/actions';
import {AppBindingLocations, AppCallResponseTypes, AppCallTypes, AppExpandLevels} from 'mattermost-redux/constants/apps';
import {Channel} from 'mattermost-redux/types/channels';
import {Post} from 'mattermost-redux/types/posts';

import Markdown from 'components/markdown';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';
import {createCallContext, createCallRequest} from 'utils/apps';

type Props = {
    intl: IntlShape;
    binding: AppBinding;
    post: Post;
    actions: {
        doAppCall: (call: AppCallRequest, type: AppCallType, intl: IntlShape) => Promise<ActionResult>;
        getChannel: (channelId: string) => Promise<ActionResult>;
    };
    sendEphemeralPost: (message: string, channelID?: string, rootID?: string, userID?: string) => void;
}

type State = {
    executing: boolean;
}

export class ButtonBinding extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            executing: false,
        };
    }

    handleClick = async () => {
        const {binding, post} = this.props;
        if (!binding.call) {
            return;
        }

        let teamID = '';
        const {data} = await this.props.actions.getChannel(post.channel_id) as {data?: any; error?: any};
        if (data) {
            const channel = data as Channel;
            teamID = channel.team_id;
        }

        const context = createCallContext(
            binding.app_id,
            AppBindingLocations.IN_POST + '/' + binding.location,
            post.channel_id,
            teamID,
            post.id,
            post.root_id,
        );
        const call = createCallRequest(
            binding.call,
            context,
            {post: AppExpandLevels.EXPAND_ALL},
        );
        this.setState({executing: true});
        const res = await this.props.actions.doAppCall(call, AppCallTypes.SUBMIT, this.props.intl);

        this.setState({executing: false});
        const callResp = (res as {data: AppCallResponse}).data;
        const ephemeral = (message: string) => this.props.sendEphemeralPost(message, this.props.post.channel_id, this.props.post.root_id, callResp.app_metadata?.bot_user_id);
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
