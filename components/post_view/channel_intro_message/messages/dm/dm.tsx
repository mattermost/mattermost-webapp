// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';

import {Channel} from '@mattermost/types/channels';
import ProfilePicture from 'components/profile_picture';
import {UserProfile as UserProfileRedux} from '@mattermost/types/users';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import UserProfile from 'components/user_profile';
import * as Utils from 'utils/utils';
import BoardsButton from '../../boards_button';
import SetHeaderButton from '../../set_header_button';
import {isArchivedChannel} from 'utils/channel_utils';
import {t} from 'utils/i18n';

type Props = {
    channel: Channel;
    teammate?: UserProfileRedux;
    teammateName?: string;
}

const messages = defineMessages({
    DM: {
        id: t('intro_messages.DM'),
        defaultMessage: 'This is the start of your direct message history with {teammate}.\\nDirect messages and files shared here are not shown to people outside this area.',
    },
    teammate: {
        id: t('intro_messages.teammate'),
        defaultMessage: 'This is the start of your direct message history with this teammate. Direct messages and files shared here are not shown to people outside this area.',
    },
});

const DMIntroMessage = ({
    channel,
    teammate,
    teammateName,
}: Props) => {
    if (teammate) {
        const src = teammate ? Utils.imageURLForUser(teammate.id, teammate.last_picture_update) : '';

        const renderButtons = !isArchivedChannel(channel) && !teammate?.is_bot;
        const boardCreateButton = renderButtons ? <BoardsButton/> : null;

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
                        {...messages.DM}
                        values={{
                            teammate: teammateName,
                        }}
                    />
                </p>
                {boardCreateButton}
                <SetHeaderButton show={renderButtons}/>
            </>
        );
    }

    return (
        <p className='channel-intro-text'>
            <FormattedMessage {...messages.teammate}/>
        </p>
    );
};

export default React.memo(DMIntroMessage);
