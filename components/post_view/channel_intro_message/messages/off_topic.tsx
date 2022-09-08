// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {defineMessages, FormattedMessage} from 'react-intl';

import {Channel} from '@mattermost/types/channels';
import {PluginComponent} from 'types/store/plugins';
import {isArchivedChannel} from 'utils/channel_utils';
import AddMembersButton from '../add_members_button';
import BoardsButton from '../boards_button';
import SetHeaderButton from '../set_header_button';
import {t} from 'utils/i18n';

type Props = {
    channel: Channel;
    stats: any;
    usersLimit: number;
    boardComponent?: PluginComponent;
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
    stats,
    usersLimit,
    boardComponent,
}: Props) => {
    const totalUsers = stats.total_users_count;

    const renderButtons = !isArchivedChannel(channel);
    const boardCreateButton = renderButtons ? <BoardsButton boardComponent={boardComponent}/> : null;
    const setHeaderButton = renderButtons ? <SetHeaderButton channel={channel}/> : null;

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
                setHeader={setHeaderButton}
                totalUsers={totalUsers}
                usersLimit={usersLimit}
                channel={channel}
                createBoard={boardCreateButton}
            />
        </>
    );
};

export default React.memo(OffTopicIntroMessage);
