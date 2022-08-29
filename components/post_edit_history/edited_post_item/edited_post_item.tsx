// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useIntl} from 'react-intl';

import PostAriaLabelDiv from 'components/post_view/post_aria_label_div';
import UserProfile from 'components/user_profile';
import {AppEvents} from 'utils/constants';
import {t} from 'utils/i18n';
import EditPost from 'components/edit_post';
import AutoHeightSwitcher, {AutoHeightSlots} from 'components/common/auto_height_switcher';
import {Post} from '@mattermost/types/posts';
import PostProfilePicture from 'components/post_profile_picture';
import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content';
import PostMessageContainer from 'components/post_view/post_message_view';

type Props = {
    post: Post;
}

const EditedPostItem = ({post}: Props) => {

    const {formatMessage} = useIntl();
    const formattedMessage = formatMessage({
        id: t('search_item.jump'),
        defaultMessage: 'Jump',
    });

    const handleJumpClick = () => {
        console.log('jump clicked');
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

    const rhsControls = (
        <div className='col__controls post-menu'>
            <a
                href='#'
                onClick={handleJumpClick}
                className='search-item__jump'
            >
                {formattedMessage}
            </a>
        </div>
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
