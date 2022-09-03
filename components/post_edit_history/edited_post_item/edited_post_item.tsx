// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {useIntl} from 'react-intl';
import classNames from 'classnames';

import IconButton from '@mattermost/compass-components/components/icon-button';

import {Post} from '@mattermost/types/posts';

import Constants from 'utils/constants';
import {t} from 'utils/i18n';
import {imageURLForUser} from 'utils/utils';

import PostAriaLabelDiv from 'components/post_view/post_aria_label_div';
import OverlayTrigger from 'components/overlay_trigger';
import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content';
import PostMessageContainer from 'components/post_view/post_message_view';
import Tooltip from 'components/tooltip';
import Avatar from 'components/widgets/users/avatar';
import UserProfileComponent from 'components/user_profile';
import Timestamp, {RelativeRanges} from 'components/timestamp';

const DATE_RANGES = [
    RelativeRanges.TODAY_TITLE_CASE,
    RelativeRanges.YESTERDAY_TITLE_CASE,
];

type Props = {
    post: Post;
    isCurrent?: boolean;
}

const EditedPostItem = ({post, isCurrent = false}: Props) => {
    const {formatMessage} = useIntl();
    const [open, setOpen] = useState(isCurrent);

    if (!post) {
        return null;
    }

    console.log('post: ', post)

    const formattedHelpText = formatMessage({
        id: t('post_info.edit.restore'),
        defaultMessage: 'Restore',
    });
    const currentVersionText = formatMessage({
        id: t('post_info.edit.current_version'),
        defaultMessage: 'Current Version',
    });

    const handleRestore = () => {
        console.log('revert clicked');
    };

    const togglePost = () => setOpen((prevState) => !prevState);

    const currentVersionIndicator = isCurrent ? (
        <div className='edit-post__current__indicator'>
            {currentVersionText}
        </div>
    ) : undefined;

    const profileSrc = imageURLForUser(post.user_id);

    const avatar = (
        <Avatar
            size={'sm'}
            url={profileSrc}
            className={'avatar-post-preview'}
        />
    );

    const overwriteName = post.props ? post.props.override_username : '';
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
                    overwriteName={overwriteName}
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

    const messageContainer = (
        <>
            {postHeader}
            <div className='post__content' >
                <div className='search-item-snippet post__body'>
                    {message}
                </div>
            </div >
        </>
    );

    const tooltip = (
        <Tooltip
            id='editPostRestoreTooltip'
            className='hidden-xs'
        >
            {formattedHelpText}
        </Tooltip>
    );

    const restoreButton = isCurrent ? undefined : (
        <OverlayTrigger
            trigger={['hover', 'focus']}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='bottom'
            overlay={tooltip}
        >
            <IconButton
                size={'sm'}
                icon={'refresh'} // todo sinan find the correct icon
                onClick={handleRestore}
                compact={true}
                aria-label='Select to restore an old message.' // todo proper wording and translation needed
                className='edit-post__icon__button'
            />
        </OverlayTrigger>
    );

    const postContainerClass = classNames('edit-post__container', {'edit-post__container__background': open});
    const timeStampValue = post.edit_at === 0 ? post.create_at : post.edit_at;
    return (
        <div className={postContainerClass}>
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
                        <Timestamp
                            value={timeStampValue}
                            ranges={DATE_RANGES}
                        />
                    </span>
                    {restoreButton}
                </div>
                {currentVersionIndicator}
                {open && messageContainer}
            </PostAriaLabelDiv>
        </div>
    );
};

export default EditedPostItem;
