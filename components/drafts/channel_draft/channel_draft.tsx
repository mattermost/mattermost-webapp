// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {getChannel} from 'mattermost-redux/actions/channels';
import {$ID} from 'mattermost-redux/types/utilities';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile, UserStatus} from 'mattermost-redux/types/users';

import {PostDraft} from 'types/store/rhs';

import DraftTitle from '../draft_title';
import DraftActions from '../draft_actions';
import Panel from '../panel/panel';
import Header from '../panel/panel_header';
import Body from '../panel/panel_body';

type Props = {
    channel: Channel;
    displayName: string;
    draftId: string;
    id: $ID<Channel>;
    status: UserStatus['status'];
    type: 'channel' | 'thread';
    user: UserProfile;
    value: PostDraft;
}

function ChannelDraft({
    channel,
    displayName,
    draftId,
    id,
    status,
    type,
    user,
    value,
}: Props) {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!channel?.id) {
            dispatch(getChannel(id));
        }
    }, [channel?.id]);

    if (!channel) {
        return null;
    }

    return (
        <Panel>
            {({hover}) => (
                <>
                    <Header
                        hover={hover}
                        actions={(
                            <DraftActions
                                channel={channel}
                                channelName={channel.display_name || displayName}
                                draftId={draftId}
                                id={id}
                                type={type}
                                value={value}
                            />
                        )}
                        title={(
                            <DraftTitle
                                channel={channel}
                                type={type}
                                userId={user.id}
                            />
                        )}
                        timestamp={value.createAt}
                    />
                    <Body
                        channelId={channel.id}
                        displayName={displayName}
                        draftId={draftId}
                        fileInfos={value.fileInfos}
                        message={value.message}
                        status={status}
                        uploadsInProgress={value.uploadsInProgress}
                        user={user}
                    />
                </>
            )}
        </Panel>
    );
}

export default memo(ChannelDraft);
