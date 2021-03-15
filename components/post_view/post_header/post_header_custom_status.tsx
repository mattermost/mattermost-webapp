// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {FormattedMessage} from 'react-intl';

import {setStatusDropdown} from 'actions/views/status_dropdown';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import {makeGetCustomStatus, showPostHeaderUpdateStatusButton, isCustomStatusEnabled} from 'selectors/views/custom_status';
import {GlobalState} from 'types/store';
import EmojiIcon from 'components/widgets/icons/emoji_icon';

interface ComponentProps {
    userId: string;
    isSystemMessage: boolean;
    isBot: boolean;
}

const PostHeaderCustomStatus = (props: ComponentProps) => {
    const {userId, isSystemMessage, isBot} = props;
    const getCustomStatus = makeGetCustomStatus();
    const dispatch = useDispatch();
    const userCustomStatus = useSelector((state: GlobalState) => getCustomStatus(state, userId));
    const showUpdateStatusButton = useSelector(showPostHeaderUpdateStatusButton);
    const customStatusEnabled = useSelector(isCustomStatusEnabled);

    const isCustomStatusSet = userCustomStatus && userCustomStatus.emoji;
    if (!customStatusEnabled || isSystemMessage || isBot) {
        return null;
    }

    if (isCustomStatusSet) {
        return (
            <CustomStatusEmoji
                userID={userId}
                showTooltip={true}
                emojiSize={14}
                emojiStyle={{
                    marginLeft: 4,
                    marginTop: 2,
                }}
            />
        );
    }

    // This must be checked after checking that custom status is not null
    if (!showUpdateStatusButton) {
        return null;
    }

    const updateStatus = () => dispatch(setStatusDropdown(true));

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
};

export default PostHeaderCustomStatus;
