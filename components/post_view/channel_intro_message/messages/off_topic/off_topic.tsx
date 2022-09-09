// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';

import {Channel} from '@mattermost/types/channels';
import {isArchivedChannel} from 'utils/channel_utils';
import AddMembersButton from '../../add_members_button';
import {t} from 'utils/i18n';

type Props = {
    channel: Channel;
    usersLimit: number;
}

const messages = defineMessages({
    beginning: {
        id: t('intro_messages.beginning'),
        defaultMessage: 'Beginning of {name}',
    },
    offTopic: {
        id: t('intro_messages.offTopic'),
        defaultMessage: 'This is the start of {display_name}, a channel for non-work-related conversations.',
    },
});

const OffTopicIntroMessage = ({
    channel,
    usersLimit,
}: Props) => {
    const renderButtons = !isArchivedChannel(channel);

    return (
        <>
            <h2 className='channel-intro__title'>
                <FormattedMessage
                    {...messages.beginning}
                    values={{
                        name: channel.display_name,
                    }}
                />
            </h2>
            <p className='channel-intro__content'>
                <FormattedMessage
                    {...messages.offTopic}
                    values={{
                        display_name: channel.display_name,
                    }}
                />
            </p>
            <AddMembersButton
                showSetHeader={renderButtons}
                showBoardsButton={renderButtons}
                usersLimit={usersLimit}
            />
        </>
    );
};

export default React.memo(OffTopicIntroMessage);
