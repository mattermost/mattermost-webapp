// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import {imageURLForUser} from 'utils/utils.jsx';
import {Constants} from 'utils/constants';

import Avatar from 'components/widgets/users/avatar';

import './draft_title.scss';

type Props = {
    channel: Channel;
    channelName: string;
    teammate?: UserProfile;
    teammateId?: string;
    type: 'channel' | 'thread';
}

function DraftTitle({
    channel,
    channelName,
    teammate,
    teammateId,
    type,
}: Props) {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!teammate?.id && teammateId) {
            dispatch(getMissingProfilesByIds([teammateId]));
        }
    }, [teammate?.id, teammateId]);

    let prefix = 'To: ';
    let icon = <i className='icon icon-globe'/>;

    if (type === 'thread') {
        return (
            <>{'Thread in:' } {icon} {channelName}</>
        );
    }

    switch (channel.type) {
    case Constants.DM_CHANNEL: {
        const profileImg = imageURLForUser(teammate?.id, teammate?.last_picture_update);
        icon = (
            <Avatar
                size='xs'
                username={teammate?.username}
                url={profileImg}
                className='DraftTitle__avatar'
            />
        );
        break;
    }
    case Constants.GM_CHANNEL:
        icon = (
            <div className='DraftTitle__group-icon'>{channelName.split(',').length}</div>
        );
        break;
    default:
        prefix = 'In: ';
    }

    return (
        <>{prefix} {icon} {channelName}</>
    );
}

export default memo(DraftTitle);
