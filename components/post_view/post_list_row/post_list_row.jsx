// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {Posts} from 'mattermost-redux/constants';

import Post from 'components/post_view/post';
import DateSeparator from 'components/post_view/date_separator';
import NewMessageSeparator from 'components/post_view/new_message_separator';
import CreateChannelIntroMessage from 'components/post_view/channel_intro_message/';

export default class PostListRow extends React.PureComponent {
    static propTypes = {
        post: PropTypes.object,
        listId: PropTypes.string.isRequired,
        channel: PropTypes.object,
        fullWidth: PropTypes.bool,
    }

    render() {
        const {post, listId} = this.props;
        if (post) {
            return (
                <Post
                    ref={post.id}
                    key={'post ' + (post.id || post.pending_post_id)}
                    post={post}
                />
            );
        }

        if (listId.indexOf(Posts.POST_LIST_SEPARATORS.DATE_LINE) === 0) {
            const postDay = new Date(listId.split(Posts.POST_LIST_SEPARATORS.DATE_LINE)[1]);
            return (
                <DateSeparator
                    key={listId}
                    date={postDay}
                />
            );
        }

        if (listId.indexOf(Posts.POST_LIST_SEPARATORS.START_OF_NEW_MESSAGES) === 0) {
            return (
                <NewMessageSeparator separatorId={listId}/>
            );
        }

        if (listId === 'CHANNEL_INTRO_MESSAGE') {
            return (
                <CreateChannelIntroMessage
                    channel={this.props.channel}
                    fullWidth={this.props.fullWidth}
                />
            );
        }

        if (listId === 'MORE_MESSAGES_LOADER') {
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
