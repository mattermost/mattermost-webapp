// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import {imageURLForUser, localizeMessage} from 'utils/utils.jsx';
import {Constants} from 'utils/constants';

import Avatar from 'components/widgets/users/avatar';

import './draft_title.scss';

type Props = {
    channel: Channel;
    channelName: string;
    selfDraft: boolean;
    teammate?: UserProfile;
    teammateId?: string;
    type: 'channel' | 'thread';
}

function DraftTitle({
    channel,
    channelName,
    selfDraft,
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

    let you = null;
    if (selfDraft) {
        you = (
            <FormattedMessage
                id='drafts.draft_title.you'
                defaultMessage={'(you)'}
            />
        );
    }

    if (type === 'thread') {
        return (
            <>
                <FormattedMessage
                    id='drafts.draft_title.thread'
                    defaultMessage={'Thread in: {icon} {channelName}'}
                    values={{
                        icon: <i className='icon icon-globe'/>,
                        channelName,
                    }}
                />
                &nbsp;{you}
            </>
        );
    }

    switch (channel.type) {
    case Constants.DM_CHANNEL: {
        return (
            <>
                <FormattedMessage
                    id='drafts.draft_title.dm_channel'
                    defaultMessage={'In: {icon} {channelName}'}
                    values={{
                        icon: (
                            <Avatar
                                size='xs'
                                username={teammate?.username}
                                url={imageURLForUser(teammate?.id, teammate?.last_picture_update)}
                                className='DraftTitle__avatar'
                            />
                        ),
                        channelName,
                    }}
                />
                &nbsp;{you}
            </>
        );
    }
    case Constants.GM_CHANNEL:
        return (
            <FormattedMessage
                id='drafts.draft_title.gm_channel'
                defaultMessage={'In: {icon} {channelName}'}
                values={{
                    icon: (
                        <div className='DraftTitle__group-icon'>
                            {channelName.split(',').length}
                        </div>
                    ),
                    channelName,
                }}
            />
        );
    }

    return (
        <FormattedMessage
            id='drafts.draft_title.channel'
            defaultMessage={'To: {icon} {channelName}'}
            values={{
                icon: <i className='icon icon-globe'/>,
                channelName,
            }}
        />
    );
}

export default memo(DraftTitle);
