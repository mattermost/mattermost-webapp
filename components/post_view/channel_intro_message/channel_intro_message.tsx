// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {UserProfile as UserProfileRedux} from '@mattermost/types/users';

import {Channel} from '@mattermost/types/channels';

import {Constants} from 'utils/constants';

import {PluginComponent} from 'types/store/plugins';

import DMIntroMessage from './messages/dm';
import StandardIntroMessage from './messages/standard';
import GMIntroMessage from './messages/gm';
import DefaultIntroMessage from './messages/default';
import OffTopicIntroMessage from './messages/off_topic';

type Props = {
    currentUserId: string;
    channel: Channel;
    fullWidth: boolean;
    locale: string;
    channelProfiles: UserProfileRedux[];
    enableUserCreation?: boolean;
    isReadOnly?: boolean;
    teamIsGroupConstrained?: boolean;
    creatorName: string;
    teammate?: UserProfileRedux;
    teammateName?: string;
    stats: any;
    usersLimit: number;
    actions: {
        getTotalUsersStats: () => any;
    };
    boardComponent?: PluginComponent;
}

export default class ChannelIntroMessage extends React.PureComponent<Props> {
    componentDidMount() {
        if (!this.props.stats?.total_users_count) {
            this.props.actions.getTotalUsersStats();
        }
    }
    render() {
        const {
            currentUserId,
            channel,
            creatorName,
            fullWidth,
            locale,
            enableUserCreation,
            isReadOnly,
            channelProfiles,
            teamIsGroupConstrained,
            teammate,
            teammateName,
            stats,
            usersLimit,
            boardComponent,
        } = this.props;

        let centeredIntro = '';
        if (!fullWidth) {
            centeredIntro = 'channel-intro--centered';
        }

        if (channel.type === Constants.DM_CHANNEL) {
            return (
                <DMIntroMessage
                    channel={channel}
                    centeredIntro={centeredIntro}
                    teammate={teammate}
                    teammateName={teammateName}
                    boardComponent={boardComponent}
                />
            );
        } else if (channel.type === Constants.GM_CHANNEL) {
            return (
                <GMIntroMessage
                    channel={channel}
                    centeredIntro={centeredIntro}
                    profiles={channelProfiles}
                    currentUserId={currentUserId}
                    boardComponent={boardComponent}
                />
            );
        } else if (channel.name === Constants.DEFAULT_CHANNEL) {
            return (
                <DefaultIntroMessage
                    channel={channel}
                    centeredIntro={centeredIntro}
                    stats={stats}
                    usersLimit={usersLimit}
                    enableUserCreation={enableUserCreation}
                    isReadOnly={isReadOnly}
                    teamIsGroupConstrained={teamIsGroupConstrained}
                    boardComponent={boardComponent}
                />
            );
        } else if (channel.name === Constants.OFFTOPIC_CHANNEL) {
            return (
                <OffTopicIntroMessage
                    channel={channel}
                    centeredIntro={centeredIntro}
                    stats={stats}
                    usersLimit={usersLimit}
                    boardComponent={boardComponent}
                />
            );
        } else if (channel.type === Constants.OPEN_CHANNEL || channel.type === Constants.PRIVATE_CHANNEL) {
            return (
                <StandardIntroMessage
                    channel={channel}
                    centeredIntro={centeredIntro}
                    stats={stats}
                    usersLimit={usersLimit}
                    locale={locale}
                    creatorName={creatorName}
                    boardComponent={boardComponent}
                />
            );
        }
        return null;
    }
}
