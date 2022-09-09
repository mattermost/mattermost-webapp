// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import {defineMessages, FormattedDate, FormattedMessage} from 'react-intl';

import {Constants} from 'utils/constants';
import {Channel} from '@mattermost/types/channels';
import {isArchivedChannel} from 'utils/channel_utils';
import AddMembersButton from '../../add_members_button';
import {getMonthLong, t} from 'utils/i18n';

type Props = {
    channel: Channel;
    creatorName: string;
    locale: string;
    usersLimit: number;
}

const messages = defineMessages({
    beginning: {
        id: t('intro_messages.beginning'),
        defaultMessage: 'Beginning of {name}',
    },
    onlyInvited: {
        id: t('intro_messages.onlyInvited'),
        defaultMessage: ' Only invited members can see this private channel.',
    },
    anyMember: {
        id: t('intro_messages.anyMember'),
        defaultMessage: ' Any member can join and read this channel.',
    },
    noCreatorPrivate: {
        id: t('intro_messages.noCreatorPrivate'),
        defaultMessage: 'This is the start of the {name} private channel, created on {date}.',
    },
    noCreator: {
        id: t('intro_messages.noCreator'),
        defaultMessage: 'This is the start of the {name} channel, created on {date}.',
    },
    creatorPrivate: {
        id: t('intro_messages.creatorPrivate'),
        defaultMessage: 'This is the start of the {name} private channel, created by {creator} on {date}.',
    },
    creator: {
        id: t('intro_messages.creator'),
        defaultMessage: 'This is the start of the {name} channel, created by {creator} on {date}.',
    },
    purposePrivate: {
        id: t('intro_messages.purposePrivate'),
        defaultMessage: " This private channel's purpose is: {purpose}",
    },
    purpose: {
        id: t('intro_messages.purpose'),
        defaultMessage: " This channel's purpose is: {purpose}",
    },
});

const StandardIntroMessage = ({
    channel,
    creatorName,
    locale,
    usersLimit,
}: Props) => {
    const uiName = channel.display_name;
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const isOpen = channel.type === Constants.OPEN_CHANNEL;
    const isPrivateOrOpen = isPrivate || isOpen;

    const memberMessage = useMemo(() => {
        if (isArchivedChannel(channel)) {
            return null;
        }
        return <FormattedMessage {...isPrivate ? messages.onlyInvited : messages.anyMember}/>;
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
            return (
                <FormattedMessage
                    {...isPrivate ? messages.noCreatorPrivate : messages.noCreator}
                    values={{purpose: channel.purpose}}
                />
            );
        }

        return (
            <FormattedMessage
                {...(isPrivate ? messages.creatorPrivate : messages.creator)}
                values={{
                    name: uiName,
                    creator: creatorName || undefined,
                    date,
                }}
            />
        );
    }, [channel.create_at, channel.purpose, creatorName, isPrivate, locale, uiName]);

    const purposeMessage = useMemo(() => {
        return (
            <FormattedMessage
                {...(isPrivate ? messages.purposePrivate : messages.purpose)}
                values={{purpose: channel.purpose}}
            />
        );
    }, [channel.purpose, isPrivate]);

    const renderButtons = !isArchivedChannel(channel);

    const channelInviteButton = (
        <AddMembersButton
            usersLimit={usersLimit}
            showSetHeader={renderButtons}
            showBoardsButton={renderButtons}
        />
    );

    return (
        <>
            <h2 className='channel-intro__title'>
                <FormattedMessage
                    {...messages.beginning}
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
