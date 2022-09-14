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

export const TestIds = {
    dm: 'dm-intro',
    gm: 'gm-intro',
    offTopic: 'off-topic-intro',
    default: 'default-intro',
    standard: 'standard-intro',
};

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
                <DMIntroMessage
                    data-testid={TestIds.dm}
                />);
        case Constants.GM_CHANNEL:
            return (
                <GMIntroMessage
                    data-testid={TestIds.gm}
                />
            );
        case Constants.DEFAULT_CHANNEL:
            return (
                <DefaultIntroMessage
                    usersLimit={usersLimit}
                    data-testid={TestIds.default}
                />);
        case Constants.OFFTOPIC_CHANNEL:
            return (
                <OffTopicIntroMessage
                    usersLimit={usersLimit}
                    data-testid={TestIds.offTopic}
                />);
        case Constants.OPEN_CHANNEL:
        case Constants.PRIVATE_CHANNEL:
            return (
                <StandardIntroMessage
                    usersLimit={usersLimit}
                    data-testid={TestIds.standard}
                />);
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
