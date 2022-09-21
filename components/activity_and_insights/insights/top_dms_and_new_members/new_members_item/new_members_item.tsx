// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useCallback} from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {trackEvent} from 'actions/telemetry_actions';

import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';

import {UserProfile} from '@mattermost/types/users';
import {NewMember} from '@mattermost/types/insights';
import {Team} from '@mattermost/types/teams';

import {displayUsername} from 'mattermost-redux/utils/user_utils';

import Avatar from 'components/widgets/users/avatar';
import RenderEmoji from 'components/emoji/render_emoji';

import {imageURLForUser} from 'utils/utils';

import './../../../activity_and_insights.scss';

type Props = {
    newMember: NewMember;
    team: Team;
}

const NewMembersItem = ({newMember, team}: Props) => {
    const teammateNameDisplaySetting = useSelector(getTeammateNameDisplaySetting);

    const trackClick = useCallback(() => {
        trackEvent('insights', 'open_new_members_from_new_members_widget');
    }, []);

    return (
        <Link
            className='top-dms-item new-members-item'
            onClick={trackClick}
            to={`/${team.name}/messages/@${newMember.username}`}
        >
            <Avatar
                url={imageURLForUser(newMember.id)}
                size={'xl'}
            />
            <div className='dm-info'>
                <div className='dm-name'>
                    {displayUsername(newMember as UserProfile, teammateNameDisplaySetting)}
                </div>
                <span className='dm-role'>{newMember.position}</span>
                <div className='channel-message-count'>
                    <RenderEmoji
                        emojiName={'wave'}
                        size={14}
                    />
                    <div className='say-hello'>
                        <FormattedMessage
                            id='insights.newMembers.sayHello'
                            defaultMessage='Say hello'
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default memo(NewMembersItem);
