// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { useState } from 'react';

import {useIntl} from 'react-intl';

import IconButton from '@mattermost/compass-components/components/icon-button';

import PostAriaLabelDiv from 'components/post_view/post_aria_label_div';
import OverlayTrigger from 'components/overlay_trigger';
import Constants, {AppEvents} from 'utils/constants';
import {t} from 'utils/i18n';
import EditPost from 'components/edit_post';
import AutoHeightSwitcher, {AutoHeightSlots} from 'components/common/auto_height_switcher';
import {Post} from '@mattermost/types/posts';
import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content';
import PostMessageContainer from 'components/post_view/post_message_view';
import Tooltip from 'components/tooltip';
import Avatar from 'components/widgets/users/avatar';
import {imageURLForUser} from 'utils/utils';
import UserProfileComponent from 'components/user_profile';
import classNames from 'classnames';

type Props = {
    post: Post;
}

const EditedPostItem = ({post}: Props) => {
    const {formatMessage} = useIntl();
    const [open, setOpen] = useState(false);

    const formattedHelpText = formatMessage({
        id: t('post_info.edit.restore'),
        defaultMessage: 'Restore',
    });
    const currentVersionText = formatMessage({
        id: t('post_info.edit.current_version'),
        defaultMessage: 'Current Version',
    });

    const handleJumpClick = () => {
        console.log('revert clicked');
    };

    const togglePost = () => setOpen(prevState => !prevState)

    const currentVersionIndicator = (
        // todo sinan fix width
        <div className='edit-post__current__indicator'>
            {currentVersionText}
        </div>
    );

    const profileSrc = imageURLForUser(post.user_id);

    const avatar = (
        <Avatar
            size={'sm'}
            url={profileSrc}
            className={'avatar-post-preview'}
        />
    );

    const postHeader = (
        <div className='edit-post__header'>
            <span className='profile-icon'>
                {avatar}
            </span>
            <div className={'edit-post__header__username'}>
                <UserProfileComponent
                    userId={post.user_id}
                    hasMention={true}
                    disablePopover={true}
                />
            </div>
        </div>
    );

    const message = (
        <PostBodyAdditionalContent
            post={post}
        >
            <PostMessageContainer
                post={post}
                isRHS={true}
            />
        </PostBodyAdditionalContent>
    );

    const tooltip = (
        <Tooltip
            id='editPostRestoreTooltip'
            className='hidden-xs'
        >
            {formattedHelpText}
        </Tooltip>
    );

    const rhsControls = (
        <OverlayTrigger
            trigger={['hover', 'focus']}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='bottom'
            overlay={tooltip}
        >
            <IconButton
                size={'sm'}
                icon={'refresh'} // todo sinan find the correct icon
                onClick={handleJumpClick}
                compact={true}
                aria-label='Select to restore an old message.' // todo proper wording and translation needed
                className='edit-post__icon__button'
            />
        </OverlayTrigger>
    );

    const postContentClass = classNames('post__content', {'edit-post__container__visible': open});
    return (
        <div className='edit-post__container'>
            <IconButton
                size={'sm'}
                icon={open ? 'chevron-down' : 'chevron-right'}
                onClick={togglePost}
                compact={true}
                aria-label='Toggle to see an old message.' // todo proper wording and translation needed
                className='edit-post__icon__button'
            />
            <PostAriaLabelDiv
                className={'a11y__section post'}
                id={'searchResult_' + post.id}
                post={post}
            >
                <div
                    className='edit-post__date__container'
                    aria-hidden='true'
                >
                    <span className='edit-post__date'>
                        {'Today, 10:37 AM'}
                        {/* todo sinan replace with variable */}
                    </span>
                    {rhsControls}
                </div>
                {currentVersionIndicator}
                {postHeader}
                <div className={postContentClass}>
                    <div>
                        <div className='search-item-snippet post__body'>
                            <AutoHeightSwitcher
                                showSlot={AutoHeightSlots.SLOT1}
                                shouldScrollIntoView={false}
                                slot1={message}
                                slot2={<EditPost/>}
                                onTransitionEnd={() => document.dispatchEvent(new Event(AppEvents.FOCUS_EDIT_TEXTBOX))}
                            />
                            {/* {fileAttachment} */}
                        </div>
                    </div>
                </div>
            </PostAriaLabelDiv>
        </div>
    );
};

export default EditedPostItem;
