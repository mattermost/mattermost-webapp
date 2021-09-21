// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useMemo, useEffect, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';

import {getChannel} from 'mattermost-redux/actions/channels';
import {$ID} from 'mattermost-redux/types/utilities';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile, UserStatus} from 'mattermost-redux/types/users';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {makeOnSubmit} from 'actions/views/create_comment';
import {setGlobalItem} from 'actions/storage';
import {getChannelURL} from 'utils/utils';
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
    const history = useHistory();

    const teamId = useSelector(getCurrentTeamId);
    const channelUrl = useSelector((state) => getChannelURL(state, channel, teamId));

    useEffect(() => {
        if (!channel?.id) {
            dispatch(getChannel(id));
        }
    }, [channel?.id]);

    const onSubmit = useMemo(() => {
        return makeOnSubmit(channel.id, '', '');
    }, [channel.id]);

    const handleSubmit = async () => {
        await dispatch(onSubmit(value));
        return {data: true};
    };

    const handleOnEdit = useCallback(() => {
        history.push(channelUrl);
    }, [channelUrl]);

    const handleOnSend = useCallback((id: string) => {
        handleSubmit().then(() => {
            handleOnDelete(id);
            handleOnEdit();
        });
    }, []);

    const handleOnDelete = useCallback((id: string) => {
        localStorage.removeItem(id);
        dispatch(setGlobalItem(id, {message: '', fileInfos: [], uploadsInProgress: []}));
    }, []);

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
                                channelName={channel.display_name || displayName}
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
