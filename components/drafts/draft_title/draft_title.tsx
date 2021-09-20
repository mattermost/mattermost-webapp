// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {FormattedMessage} from 'react-intl';

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

    let icon = <i className='icon icon-globe'/>;

    if (channel.type === Constants.DM_CHANNEL) {
        icon = (
            <Avatar
                size='xs'
                username={teammate?.username}
                url={imageURLForUser(teammate?.id, teammate?.last_picture_update)}
                className='DraftTitle__avatar'
            />
        );
    }

    if (channel.type === Constants.GM_CHANNEL) {
        icon = (
            <div className='DraftTitle__group-icon'>
                {channelName.split(',').length}
            </div>
        );
    }

    if (type === 'thread') {
        if (
            channel.type !== Constants.GM_CHANNEL &&
            channel.type !== Constants.DM_CHANNEL
        ) {
            return (
                <>
                    <FormattedMessage
                        id='drafts.draft_title.channel_thread'
                        defaultMessage={'Thread in: {icon} {channelName}'}
                        values={{
                            icon,
                            channelName,
                        }}
                    />
                    &nbsp;{you}
                </>
            );
        }

        return (
            <>
                <FormattedMessage
                    id='drafts.draft_title.direct_thread'
                    defaultMessage={'Thread to: {icon} {channelName}'}
                    values={{
                        icon,
                        channelName,
                    }}
                />
                &nbsp;{you}
            </>
        );
    }

    if (
        channel.type !== Constants.GM_CHANNEL &&
        channel.type !== Constants.DM_CHANNEL
    ) {
        return (
            <FormattedMessage
                id='drafts.draft_title.channel'
                defaultMessage={'In: {icon} {channelName}'}
                values={{
                    icon,
                    channelName,
                }}
            />
        );
    }

    return (
        <>
            <FormattedMessage
                id='drafts.draft_title.direct_channel'
                defaultMessage={'To: {icon} {channelName}'}
                values={{
                    icon,
                    channelName,
                }}
            />
            &nbsp;{you}
        </>
    );
}

export default memo(DraftTitle);
