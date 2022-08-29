// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useIntl} from 'react-intl';

import PostAriaLabelDiv from 'components/post_view/post_aria_label_div';
import UserProfile from 'components/user_profile';
import OverlayTrigger from 'components/overlay_trigger';
import Constants, {AppEvents} from 'utils/constants';
import {t} from 'utils/i18n';
import EditPost from 'components/edit_post';
import AutoHeightSwitcher, {AutoHeightSlots} from 'components/common/auto_height_switcher';
import {Post} from '@mattermost/types/posts';
import PostProfilePicture from 'components/post_profile_picture';
import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content';
import PostMessageContainer from 'components/post_view/post_message_view';
import IconButton from '@mattermost/compass-components/components/icon-button';
import Tooltip from 'components/tooltip';

type Props = {
    post: Post;
}

const EditedPostItem = ({post}: Props) => {

    const {formatMessage} = useIntl();

    const formattedHelpText = formatMessage({
        id: t('post_info.edit_restore'),
        defaultMessage: 'Restore',
    });  

    const handleJumpClick = () => {
        console.log('revert clicked');
    };

    const profilePic = (
        <PostProfilePicture
            post={post}
            userId={post.user_id}
        />
    );

    const profilePicContainer = (<div className='post__img'>{profilePic}</div>);

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
                    aria-label='Select to restore an old message.' // proper wording and translation needed
                    className='edit-post__restore__icon'
                />
            </OverlayTrigger>
    );
    return (
        <div
            data-testid='search-item-container'
            className='search-item__container'
        >
            <PostAriaLabelDiv
                className={'a11y__section post'}
                id={'searchResult_' + post.id}
                post={post}
                // data-a11y-sort-order={this.props.a11yIndex}
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
                <div
                    role='application'
                    className='post__content'
                >
                    {profilePicContainer}
                    <div>
                        <div className='post__header'>
                            <div className='col col__name'>
                                <UserProfile
                                    userId={post.user_id}
                                    isRHS={true}
                                />
                            </div>
                        </div>
                        <div className='search-item-snippet post__body'>
                            <div className='post--edited'>
                                <AutoHeightSwitcher
                                    showSlot={AutoHeightSlots.SLOT1}
                                    shouldScrollIntoView={false}
                                    slot1={message}
                                    slot2={<EditPost/>}
                                    onTransitionEnd={() => document.dispatchEvent(new Event(AppEvents.FOCUS_EDIT_TEXTBOX))}
                                />
                            </div>
                            {/* {fileAttachment} */}
                        </div>
                    </div>
                </div>
            </PostAriaLabelDiv>
        </div>
    );
};

export default EditedPostItem;
