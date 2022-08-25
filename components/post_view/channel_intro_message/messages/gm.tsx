// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {Channel} from '@mattermost/types/channels';
import ProfilePicture from 'components/profile_picture';
import {UserProfile as UserProfileRedux} from '@mattermost/types/users';
import {PluginComponent} from 'types/store/plugins';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import * as Utils from 'utils/utils';
import BoardsButton from '../boards_button';
import SetHeaderButton from '../set_header_button';

type Props = {
    channel: Channel;
    currentUserId: string;
    profiles: UserProfileRedux[];
    boardComponent?: PluginComponent;
}

const GMIntroMessage = ({
    channel,
    currentUserId,
    profiles,
    boardComponent,
}: Props) => {
    const channelIsArchived = channel.delete_at !== 0;

    const renderButtons = !channelIsArchived;
    const boardCreateButton = renderButtons ? <BoardsButton boardComponent={boardComponent}/> : null;
    const setHeaderButton = renderButtons ? <SetHeaderButton channel={channel}/> : null;

    if (profiles.length > 0) {
        const pictures = profiles.
            filter((profile) => profile.id !== currentUserId).
            map((profile) => (
                <ProfilePicture
                    key={'introprofilepicture' + profile.id}
                    src={Utils.imageURLForUser(profile.id, profile.last_picture_update)}
                    size='xl'
                    userId={profile.id}
                    username={profile.username}
                />
            ));

        return (
            <>
                <div className='post-profile-img__container channel-intro-img'>
                    {pictures}
                </div>
                <p className='channel-intro-text'>
                    <FormattedMarkdownMessage
                        id='intro_messages.GM'
                        defaultMessage='This is the start of your group message history with {names}.\nMessages and files shared here are not shown to people outside this area.'
                        values={{
                            names: channel.display_name,
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
                id='intro_messages.group_message'
                defaultMessage='This is the start of your group message history with these teammates. Messages and files shared here are not shown to people outside this area.'
            />
        </p>
    );
};

export default React.memo(GMIntroMessage);
