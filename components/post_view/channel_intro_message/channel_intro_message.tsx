// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import {Channel} from '@mattermost/types/channels';
import {Constants} from 'utils/constants';

import DMIntroMessage from './messages/dm';
import StandardIntroMessage from './messages/standard';
import GMIntroMessage from './messages/gm';
import DefaultIntroMessage from './messages/default';
import OffTopicIntroMessage from './messages/off_topic';

type Props = {
    channel: Channel;
    fullWidth: boolean;
    stats: any;
    usersLimit: number;
    actions: {
        getTotalUsersStats: () => any;
    };
}

export default class ChannelIntroMessage extends React.PureComponent<Props> {
    componentDidMount() {
        if (!this.props.stats?.total_users_count) {
            this.props.actions.getTotalUsersStats();
        }
    }

    getIntroMessage = () => {
        const {channel, usersLimit} = this.props;

        switch (channel.type) {
        case Constants.DM_CHANNEL:
            return (
                <DMIntroMessage/>
            );
        case Constants.GM_CHANNEL:
            return (
                <GMIntroMessage/>
            );
        case Constants.DEFAULT_CHANNEL:
            return (
                <DefaultIntroMessage
                    usersLimit={usersLimit}
                />
            );
        case Constants.OFFTOPIC_CHANNEL:
            return (
                <OffTopicIntroMessage
                    usersLimit={usersLimit}
                />
            );
        case Constants.OPEN_CHANNEL || channel.type === Constants.PRIVATE_CHANNEL:
            return (
                <StandardIntroMessage
                    usersLimit={usersLimit}
                />
            );
        default:
            return null;
        }
    }

    render() {
        return (
            <div
                id={'channelIntro'}
                className={classNames(
                    'channel-intro ',
                    {'channel-intro--centered': !this.props.fullWidth},
                )}
            >
                {this.getIntroMessage()}
            </div>
        );
    }
}
