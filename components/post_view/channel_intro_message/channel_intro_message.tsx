// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import {FormattedMessage} from 'react-intl';

import {Channel} from '@mattermost/types/channels';
import {Constants} from 'utils/constants';
import {t} from 'utils/i18n';

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

    beginningOfMessage = (displayName: string) => (
        <h2 className='channel-intro__title'>
            <FormattedMessage
                id={t('intro_messages.beginning')}
                defaultMessage={'Beginning of {name}'}
                values={{
                    name: displayName,
                }}
            />
        </h2>
    );

    getIntroMessage = () => {
        const {channel, usersLimit} = this.props;

        switch (true) {
        case channel.type === Constants.DM_CHANNEL:
            return (
                <DMIntroMessage
                    data-testid={TestIds.dm}
                />);
        case channel.type === Constants.GM_CHANNEL:
            return (
                <GMIntroMessage
                    data-testid={TestIds.gm}
                />
            );
        case channel.name === Constants.DEFAULT_CHANNEL:
            return (
                <>
                    {this.beginningOfMessage(channel.display_name)}
                    <DefaultIntroMessage
                        usersLimit={usersLimit}
                        data-testid={TestIds.default}
                    />
                </>);
        case channel.name === Constants.OFFTOPIC_CHANNEL:
            return (
                <>
                    {this.beginningOfMessage(channel.display_name)}
                    <OffTopicIntroMessage
                        usersLimit={usersLimit}
                        data-testid={TestIds.offTopic}
                    />
                </>);
        case channel.type === Constants.OPEN_CHANNEL:
        case channel.type === Constants.PRIVATE_CHANNEL:
            return (
                <>
                    {this.beginningOfMessage(channel.display_name)}
                    <StandardIntroMessage
                        usersLimit={usersLimit}
                        data-testid={TestIds.standard}
                    />
                </>);
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
