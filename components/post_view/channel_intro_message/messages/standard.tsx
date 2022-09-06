// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';

import {FormattedDate, FormattedMessage} from 'react-intl';

import {Constants} from 'utils/constants';

import {Channel} from '@mattermost/types/channels';
import {isArchivedChannel} from 'utils/channel_utils';
import {PluginComponent} from 'types/store/plugins';
import AddMembersButton from '../add_members_button';
import {getMonthLong} from 'utils/i18n';
import BoardsButton from '../boards_button';
import SetHeaderButton from '../set_header_button';

type Props = {
    channel: Channel;
    creatorName: string;
    locale: string;
    stats: any;
    usersLimit: number;
    boardComponent?: PluginComponent;
}

const StandardIntroMessage = ({
    channel,
    creatorName,
    locale,
    stats,
    usersLimit,
    boardComponent,
}: Props) => {
    const uiName = channel.display_name;
    const totalUsers = stats.total_users_count;

    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const isOpen = channel.type === Constants.OPEN_CHANNEL;
    const isPrivateOrOpen = isPrivate || isOpen;

    const memberMessage = useMemo(() => {
        if (isArchivedChannel(channel)) {
            return null;
        }
        const memberMessageDescriptor = {
            id: isPrivate ? 'intro_messages.onlyInvited' : 'intro_messages.anyMember',
            defaultMessage: isPrivate ? ' Only invited members can see this private channel.' : ' Any member can join and read this channel.',
        };
        return <FormattedMessage {...memberMessageDescriptor}/>;
    }, [channel, isPrivate]);

    const createMessage = useMemo(() => {
        const date = (
            <FormattedDate
                value={channel.create_at}
                month={getMonthLong(locale)}
                day='2-digit'
                year='numeric'
            />
        );

        if (!creatorName) {
            const createMessageDescriptor = {
                id: isPrivate ? 'intro_messages.noCreatorPrivate' : 'intro_messages.noCreator',
                defaultMessage: isPrivate ? 'This is the start of the {name} private channel, created on {date}.' : 'This is the start of the {name} channel, created on {date}.',
                values: {purpose: channel.purpose},
            };
            return <FormattedMessage{...createMessageDescriptor}/>;
        }

        const messageDescriptor = {
            id: isPrivate ? 'intro_messages.creatorPrivate' : 'intro_messages.creator',
            defaultMessage: isPrivate ? 'This is the start of the {name} private channel, created by {creator} on {date}.' : 'This is the start of the {name} channel, created by {creator} on {date}.',
            values: {
                name: uiName,
                creator: creatorName || undefined,
                date,
            },
        };
        return <FormattedMessage {...messageDescriptor}/>;
    }, [channel.create_at, channel.purpose, creatorName, isPrivate, locale, uiName]);

    const purposeMessage = useMemo(() => {
        const purposeMessageDescriptor = {
            id: isPrivate ? 'intro_messages.purposePrivate' : 'intro_messages.purpose',
            defaultMessage: isPrivate ? " This private channel's purpose is: {purpose}" : " This channel's purpose is: {purpose}",
            values: {purpose: channel.purpose},
        };
        return <FormattedMessage {...purposeMessageDescriptor}/>;
    }, [channel.purpose, isPrivate]);

    const renderButtons = !isArchivedChannel(channel);
    const setHeaderButton = renderButtons ? <SetHeaderButton channel={channel}/> : null;
    const boardCreateButton = renderButtons ? <BoardsButton boardComponent={boardComponent}/> : null;

    const channelInviteButton = (
        <AddMembersButton
            totalUsers={totalUsers}
            usersLimit={usersLimit}
            channel={channel}
            setHeader={setHeaderButton}
            createBoard={boardCreateButton}
        />
    );

    return (
        <>
            <h2 className='channel-intro__title'>
                <FormattedMessage
                    id='intro_messages.beginning'
                    defaultMessage='Beginning of {name}'
                    values={{
                        name: uiName,
                    }}
                />
            </h2>
            <p className='channel-intro__content'>
                {isPrivateOrOpen && createMessage}
                {memberMessage}
                {channel.purpose && isPrivateOrOpen && purposeMessage}
                <br/>
            </p>
            {channelInviteButton}
        </>
    );
};

export default React.memo(StandardIntroMessage);
