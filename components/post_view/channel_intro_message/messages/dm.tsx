// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {Channel} from '@mattermost/types/channels';
import ProfilePicture from 'components/profile_picture';
import {UserProfile as UserProfileRedux} from '@mattermost/types/users';
import {PluginComponent} from 'types/store/plugins';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import UserProfile from 'components/user_profile';
import * as Utils from 'utils/utils';
import BoardsButton from '../boards_button';
import SetHeaderButton from '../set_header_button';

type Props = {
    channel: Channel;
    boardComponent?: PluginComponent;
    teammate?: UserProfileRedux;
    teammateName?: string;
}

const DMIntroMessage = ({
    boardComponent,
    channel,
    teammate,
    teammateName,
}: Props) => {
    const channelIsArchived = channel.delete_at !== 0;
    if (teammate) {
        const src = teammate ? Utils.imageURLForUser(teammate.id, teammate.last_picture_update) : '';

        const renderButtons = !channelIsArchived && !teammate?.is_bot;
        const boardCreateButton = renderButtons ? <BoardsButton boardComponent={boardComponent}/> : null;
        const setHeaderButton = renderButtons ? <SetHeaderButton channel={channel}/> : null;

        return (
            <>
                <div className='post-profile-img__container channel-intro-img'>
                    <ProfilePicture
                        src={src}
                        size='xl'
                        userId={teammate?.id}
                        username={teammate?.username}
                        hasMention={true}
                    />
                </div>
                <div className='channel-intro-profile d-flex'>
                    <UserProfile
                        userId={teammate?.id}
                        disablePopover={false}
                        hasMention={true}
                    />
                </div>
                <p className='channel-intro-text'>
                    <FormattedMarkdownMessage
                        id='intro_messages.DM'
                        defaultMessage='This is the start of your direct message history with {teammate}.\nDirect messages and files shared here are not shown to people outside this area.'
                        values={{
                            teammate: teammateName,
                        }}
                    />
                </p>
                {boardCreateButton}
                {setHeaderButton}
            </>
        );
    }

    return (
        <p className='channel-intro-text'>
            <FormattedMessage
                id='intro_messages.teammate'
                defaultMessage='This is the start of your direct message history with this teammate. Direct messages and files shared here are not shown to people outside this area.'
            />
        </p>
    );
};

export default React.memo(DMIntroMessage);
