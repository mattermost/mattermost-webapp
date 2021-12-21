// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';
import {useSelector} from 'react-redux';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import Permissions from 'mattermost-redux/constants/permissions';

import AnyTeamPermissionGate from 'components/permissions_gates/any_team_permission_gate';

interface Props {
    customEmojisEnabled: boolean;
}

function EmojiPickerCustomEmojiButton({customEmojisEnabled}: Props) {
    const currentTeam = useSelector(getCurrentTeam);

    if (!customEmojisEnabled) {
        return null;
    }

    if (currentTeam.name.length === 0) {
        return null;
    }

    return (
        <AnyTeamPermissionGate permissions={[Permissions.CREATE_EMOJIS]}>
            <div className='emoji-picker__custom'>
                <Link
                    className='btn btn-link'
                    to={`/${currentTeam.name}/emoji`}
                >
                    <FormattedMessage
                        id='emoji_picker.custom_emoji'
                        defaultMessage='Custom Emoji'
                    />
                </Link>
            </div>
        </AnyTeamPermissionGate>
    );
}

export default EmojiPickerCustomEmojiButton;
