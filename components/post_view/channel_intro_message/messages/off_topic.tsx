// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {Channel} from '@mattermost/types/channels';
import {PluginComponent} from 'types/store/plugins';
import AddMembersButton from '../add_members_button';
import BoardsButton from '../boards_button';
import SetHeaderButton from '../set_header_button';

type Props = {
    channel: Channel;
    stats: any;
    usersLimit: number;
    boardComponent?: PluginComponent;
}

const OffTopicIntroMessage = ({
    channel,
    stats,
    usersLimit,
    boardComponent,
}: Props) => {
    const channelIsArchived = channel.delete_at !== 0;
    const totalUsers = stats.total_users_count;

    const renderButtons = !channelIsArchived;
    const boardCreateButton = renderButtons ? <BoardsButton boardComponent={boardComponent}/> : null;
    const setHeaderButton = renderButtons ? <SetHeaderButton channel={channel}/> : null;

    return (
        <>
            <h2 className='channel-intro__title'>
                <FormattedMessage
                    id='intro_messages.beginning'
                    defaultMessage='Beginning of {name}'
                    values={{
                        name: channel.display_name,
                    }}
                />
            </h2>
            <p className='channel-intro__content'>
                <FormattedMessage
                    id='intro_messages.offTopic'
                    defaultMessage='This is the start of {display_name}, a channel for non-work-related conversations.'
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
