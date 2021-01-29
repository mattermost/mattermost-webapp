// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {AppBinding, AppCall} from 'mattermost-redux/types/apps';
import {ActionResult} from 'mattermost-redux/types/actions';
import {AppBindingLocations, AppExpandLevels} from 'mattermost-redux/constants/apps';
import {Post} from 'mattermost-redux/types/posts';

import Markdown from 'components/markdown';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';

type Props = {
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

export default class ActionButton extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            executing: false,
        };
    }

    handleClick = async () => {
        const {binding, post, userId} = this.props;
        const call: AppCall = {
            url: binding.call?.url || '',
            expand: {
                post: AppExpandLevels.EXPAND_ALL,
            },
            context: {
                ...binding.call?.context,
                acting_user_id: userId,
                app_id: binding.app_id,
                channel_id: post.channel_id,
                location: AppBindingLocations.IN_POST + '/' + binding.location,
                post_id: post.id,
                user_id: userId,
            },
        };
        this.setState({executing: true});
        await this.props.actions.doAppCall(call);
        this.setState({executing: false});
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
