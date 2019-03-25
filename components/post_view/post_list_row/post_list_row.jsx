// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Post from 'components/post_view/post';
import DateSeparator from 'components/post_view/date_separator';
import NewMessageSeparator from 'components/post_view/new_message_separator/new_message_separator';
import CreateChannelIntroMessage from 'components/post_view/channel_intro_message/';
import {PostListRowListIds} from 'utils/constants';

export default class PostListRow extends React.PureComponent {
    static propTypes = {
        post: PropTypes.object,
        listId: PropTypes.string.isRequired,
        channel: PropTypes.object,
        fullWidth: PropTypes.bool,
        shouldHighlight: PropTypes.bool,
        loadMorePosts: PropTypes.func,
    }

    render() {
        const {post, listId} = this.props;
        if (post) {
            return (
                <Post
                    ref={post.id}
                    key={'post ' + (post.id || post.pending_post_id)}
                    post={post}
                    shouldHighlight={this.props.shouldHighlight}
                />
            );
        }

        if (listId.indexOf(PostListRowListIds.DATE_LINE) === 0) {
            const postDay = new Date(listId.split(PostListRowListIds.DATE_LINE)[1]);
            return (
                <DateSeparator
                    key={listId}
                    date={postDay}
                />
            );
        }

        if (listId === PostListRowListIds.START_OF_NEW_MESSAGES) {
            return (
                <NewMessageSeparator separatorId={listId}/>
            );
        }

        if (listId === PostListRowListIds.CHANNEL_INTRO_MESSAGE) {
            return (
                <CreateChannelIntroMessage
                    channel={this.props.channel}
                    fullWidth={this.props.fullWidth}
                />
            );
        }

        if (listId === PostListRowListIds.MANUAL_TRIGGER_LOAD_MESSAGES) {
            return (
                <button
                    className='more-messages-text theme style--none color--link'
                    onClick={this.props.loadMorePosts}
                >
                    <FormattedMessage
                        id='posts_view.loadMore'
                        defaultMessage='Load more messages'
                    />
                </button>
            );
        }

        if (listId === PostListRowListIds.MORE_MESSAGES_LOADER) {
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

        return null;
    }
}
