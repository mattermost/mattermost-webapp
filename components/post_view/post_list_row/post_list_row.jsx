// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as PostListUtils from 'mattermost-redux/utils/post_list';

import CombinedUserActivityPost from 'components/post_view/combined_user_activity_post';
import Post from 'components/post_view/post';
import DateSeparator from 'components/post_view/date_separator';
import NewMessageSeparator from 'components/post_view/new_message_separator/new_message_separator';
import ChannelIntroMessage from 'components/post_view/channel_intro_message/';
import {PostListRowListIds} from 'utils/constants';

export default class PostListRow extends React.PureComponent {
    static propTypes = {
        listId: PropTypes.string.isRequired,
        previousListId: PropTypes.string,
        fullWidth: PropTypes.bool,
        shouldHighlight: PropTypes.bool,
        loadOlderPosts: PropTypes.func,
        loadNewerPosts: PropTypes.func,
        togglePostMenu: PropTypes.func,
    }

    render() {
        const {listId, previousListId} = this.props;

        if (PostListUtils.isDateLine(listId)) {
            const date = PostListUtils.getDateForDateLine(listId);

            return (
                <DateSeparator
                    key={date}
                    date={date}
                />
            );
        }

        if (PostListUtils.isStartOfNewMessages(listId)) {
            return (
                <NewMessageSeparator separatorId={listId}/>
            );
        }

        if (listId === PostListRowListIds.CHANNEL_INTRO_MESSAGE) {
            return (
                <ChannelIntroMessage/>
            );
        }

        if (listId === PostListRowListIds.LOAD_OLDER_MESSAGES_TRIGGER || listId === PostListRowListIds.LOAD_NEWER_MESSAGES_TRIGGER) {
            return (
                <button
                    className='more-messages-text theme style--none color--link'
                    onClick={listId === PostListRowListIds.LOAD_OLDER_MESSAGES_TRIGGER ? this.props.loadOlderPosts : this.props.loadNewerPosts}
                >
                    <FormattedMessage
                        id='posts_view.loadMore'
                        defaultMessage='Load more messages'
                    />
                </button>
            );
        }

        if (listId === PostListRowListIds.OLDER_MESSAGES_LOADER || listId === PostListRowListIds.NEWER_MESSAGES_LOADER) {
            return (
                <div
                    className='loading-screen'
                >
                    <div className='loading__content'>
                        <div className='round round-1'/>
                        <div className='round round-2'/>
                        <div className='round round-3'/>
                    </div>
                </div>
            );
        }

        const postProps = {
            previousPostId: previousListId,
            shouldHighlight: this.props.shouldHighlight,
            togglePostMenu: this.props.togglePostMenu,
        };

        if (PostListUtils.isCombinedUserActivityPost(listId)) {
            return (
                <CombinedUserActivityPost
                    combinedId={listId}
                    {...postProps}
                />
            );
        }

        return (
            <Post
                postId={listId}
                {...postProps}
            />
        );
    }
}
