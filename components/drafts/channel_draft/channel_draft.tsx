// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useMemo, useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';

import {$ID} from 'mattermost-redux/types/utilities';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile, UserStatus} from 'mattermost-redux/types/users';

import {makeOnSubmit} from 'actions/views/create_comment';
import {removeDraft} from 'actions/views/drafts';
import {PostDraft} from 'types/store/rhs';

import DraftTitle from '../draft_title';
import DraftActions from '../draft_actions';
import Panel from '../panel/panel';
import Header from '../panel/panel_header';
import Body from '../panel/panel_body';

type Props = {
    channel: Channel;
    channelUrl: string;
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
    channelUrl,
    displayName,
    draftId,
    status,
    type,
    user,
    value,
}: Props) {
    const dispatch = useDispatch();
    const history = useHistory();

    const onSubmit = useMemo(() => {
        return makeOnSubmit(channel.id, '', '');
    }, [channel.id]);

    const handleOnEdit = useCallback(() => {
        history.push(channelUrl);
    }, [channelUrl]);

    const handleOnDelete = useCallback((id: string) => {
        dispatch(removeDraft(id));
    }, []);

    const handleOnSend = useCallback(async (id: string) => {
        await dispatch(onSubmit(value));
        dispatch(removeDraft(id));
        history.push(channelUrl);
    }, [value, onSubmit, channelUrl]);

    if (!channel) {
        return null;
    }

    return (
        <Panel onClick={handleOnEdit}>
            {({hover}) => (
                <>
                    <Header
                        hover={hover}
                        actions={(
                            <DraftActions
                                channelDisplayName={channel.display_name}
                                channelType={channel.type}
                                channelName={channel.name}
                                userId={user.id}
                                draftId={draftId}
                                onDelete={handleOnDelete}
                                onEdit={handleOnEdit}
                                onSend={handleOnSend}
                            />
                        )}
                        title={(
                            <DraftTitle
                                channel={channel}
                                type={type}
                                userId={user.id}
                            />
                        )}
                        timestamp={value.updateAt}
                    />
                    <Body
                        channelId={channel.id}
                        displayName={displayName}
                        fileInfos={value.fileInfos}
                        message={value.message}
                        status={status}
                        uploadsInProgress={value.uploadsInProgress}
                        userId={user.id}
                        username={user.username}
                    />
                </>
            )}
        </Panel>
    );
}

export default memo(ChannelDraft);
