// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {FormattedMessage} from 'react-intl';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {setStatusDropdown} from 'actions/views/status_dropdown';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import {getCustomStatus, showPostHeaderUpdateStatusButton, isCustomStatusEnabled} from 'selectors/views/custom_status';
import {GlobalState} from 'types/store';
import EmojiIcon from 'components/widgets/icons/emoji_icon';

interface ComponentProps {
    userId: string;
    isSystemMessage: boolean;
}

const PostHeaderCustomStatus = (props: ComponentProps) => {
    const {userId, isSystemMessage} = props;
    const dispatch = useDispatch();
    const userCustomStatus = useSelector((state: GlobalState) => getCustomStatus(state, userId));
    const showUpdateStatusButton = useSelector(showPostHeaderUpdateStatusButton);
    const currentUserId = useSelector(getCurrentUserId);
    const customStatusEnabled = useSelector(isCustomStatusEnabled);

    const isCustomStatusSet = userCustomStatus && userCustomStatus.emoji;
    if (customStatusEnabled && !isSystemMessage && isCustomStatusSet) {
        return (
            <CustomStatusEmoji
                userID={userId}
                showTooltip={true}
                emojiSize={14}
                emojiStyle={{
                    margin: '4px 0 0 4px',
                }}
            />
        );
    }

    const updateStatus = () => dispatch(setStatusDropdown(true));

    const isCurrentUserPost = userId === currentUserId;
    if (customStatusEnabled && !isCustomStatusSet && showUpdateStatusButton && !isSystemMessage && isCurrentUserPost) {
        return (
            <div
                onClick={updateStatus}
                className='post__header-set-custom-status cursor--pointer'
            >
                <EmojiIcon className='post__header-set-custom-status-icon'/>
                <span className='post__header-set-custom-status-text'>
                    <FormattedMessage
                        id='post_header.update_status'
                        defaultMessage='Update your status'
                    />
                </span>
            </div>
        );
    }

    return null;
};

export default PostHeaderCustomStatus;
