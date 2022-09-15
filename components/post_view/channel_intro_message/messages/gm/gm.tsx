// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';

import {Channel} from '@mattermost/types/channels';
import ProfilePicture from 'components/profile_picture';
import {UserProfile as UserProfileRedux} from '@mattermost/types/users';
import * as Utils from 'utils/utils';
import BoardsButton from '../../boards_button';
import SetHeaderButton from '../../set_header_button';
import {isArchivedChannel} from 'utils/channel_utils';
import {t} from 'utils/i18n';

type Props = {
    channel: Channel;
    currentUserId: string;
    channelProfiles: UserProfileRedux[];
}

const messages = defineMessages({
    GM: {
        id: t('intro_messages.GM'),
        defaultMessage: 'This is the start of your group message history with {names}.{br}Messages and files shared here are not shown to people outside this area.',
    },
    group_message: {
        id: t('intro_messages.group_message'),
        defaultMessage: 'This is the start of your group message history with these teammates. Messages and files shared here are not shown to people outside this area.',
    },
});

const GMIntroMessage = ({
    channel,
    currentUserId,
    channelProfiles,
}: Props) => {
    if (channelProfiles.length > 0) {
        const pictures = channelProfiles.
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
                    <FormattedMessage
                        {...messages.GM}
                        values={{
                            names: channel.display_name,
                            br: <br/>,
                        }}
                    />
                </p>
                {!isArchivedChannel(channel) && <BoardsButton/>}
                {!isArchivedChannel(channel) && <SetHeaderButton/>}
            </>
        );
    }

    return (
        <p className='channel-intro-text'>
            <FormattedMessage {...messages.group_message}/>
        </p>
    );
};

export default React.memo(GMIntroMessage);
