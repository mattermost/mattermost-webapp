// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {FormattedMessage} from 'react-intl';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import {TopThread} from '@mattermost/types/insights';
import {UserProfile} from '@mattermost/types/users';

import {selectPost} from 'actions/views/rhs';
import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';

import Badge from 'components/widgets/badges/badge';
import Avatar from 'components/widgets/users/avatar';
import Markdown from 'components/markdown';
import Attachment from 'components/threading/global_threads/thread_item/attachments';

import {ModalIdentifiers} from 'utils/constants';
import {imageURLForUser} from 'utils/utils';

import JoinChannelModal from '../../join_channel_modal/join_channel_modal';
import {getMyChannelMembership} from 'mattermost-redux/selectors/entities/channels';
import {GlobalState} from '@mattermost/types/store';

type Props = {
    thread: TopThread;
    complianceExportEnabled?: string;
}

const TopThreadsItem = ({thread, complianceExportEnabled}: Props) => {
    const dispatch = useDispatch();

    const isChannelMember = useSelector((state: GlobalState) => getMyChannelMembership(state, thread.channel_id));
    const currentTeamId = useSelector(getCurrentTeamId);
    const teammateNameDisplaySetting = useSelector(getTeammateNameDisplaySetting);

    const openRHSOrJoinChannel = useCallback(() => {
        if (!isChannelMember && complianceExportEnabled === 'true') {
            dispatch(openModal({
                modalId: ModalIdentifiers.INSIGHTS,
                dialogType: JoinChannelModal,
                dialogProps: {
                    thread,
                    currentTeamId,
                },
            }));
        } else {
            dispatch(selectPost(thread.post));
        }
    }, [thread, isChannelMember, currentTeamId]);

    const getPreview = useCallback(() => {
        if (!isChannelMember && complianceExportEnabled === 'true') {
            return (
                <FormattedMessage
                    id='insights.topThreadItem.notChannelMember'
                    defaultMessage='This thread is from a channel you are not a member of and cannot be viewed unless you join the channel'
                />
            );
        }

        if (thread.post.message) {
            return (
                <Markdown
                    message={thread.post.message}
                    options={{
                        singleline: true,
                        mentionHighlight: false,
                        atMentions: false,
                    }}
                    imagesMetadata={thread.post?.metadata && thread.post?.metadata?.images}
                />
            );
        }

        return (
            <Attachment post={thread.post}/>
        );
    }, [thread, isChannelMember]);

    return (
        <div
            className='thread-item'
            onClick={() => {
                trackEvent('insights', 'open_thread_from_top_threads_widget');
                openRHSOrJoinChannel();
            }}
            key={thread.post.id}
        >
            <div className='thread-details'>
                <Avatar
                    url={imageURLForUser(thread.user_information.id)}
                    size={'xs'}
                />
                <span className='display-name'>{displayUsername(thread.user_information as UserProfile, teammateNameDisplaySetting)}</span>
                <Badge>
                    {thread.channel_display_name}
                </Badge>
                <div className='reply-count'>
                    <i className='icon icon-reply-outline'/>
                    <span>{thread.post.reply_count}</span>
                </div>
            </div>
            <div
                aria-readonly='true'
                className='preview'
            >
                {getPreview()}
            </div>
        </div>
    );
};

export default memo(TopThreadsItem);
