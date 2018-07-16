// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {isUserActivityPost} from 'mattermost-redux/utils/post_utils';
import {Posts} from 'mattermost-redux/constants';

import Constants, {PostTypes} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import {isFromWebhook} from 'utils/post_utils.jsx';
import * as UserAgent from 'utils/user_agent.jsx';

import DateSeparator from 'components/post_view/date_separator.jsx';
import Post from 'components/post_view/post';

export default class PostList extends React.PureComponent {
    static propTypes = {

        /**
         * Array of posts in the channel, ordered from oldest to newest
         */
        posts: PropTypes.array,

        /**
         * Flag used for removing !more message buttons
         */
        disableLoadingPosts: PropTypes.bool,

        /**
         * Timestamp used for populating new messages indicator
         */
        lastViewedAt: PropTypes.number,

        /**
         * Used for excluding own messages for new messages indicator
         */
        currentUserId: PropTypes.string,

        /**
         * Data used for determining more messages state at the bottom
         */
        newerPosts: PropTypes.shape({
            loading: PropTypes.bool,
            allLoaded: PropTypes.bool,
        }),

        /**
         * Data used for determining more messages state at the top
         */
        olderPosts: PropTypes.shape({
            loading: PropTypes.bool,
            allLoaded: PropTypes.bool,
        }),

        actions: PropTypes.shape({

            /**
             * Function to get older posts in the channel
             */
            loadOlderPosts: PropTypes.func.isRequired,

            /**
             * Function to get newer posts in the channel
             */
            loadNewerPosts: PropTypes.func.isRequired,

        }).isRequired,
    }

    createPosts = (posts) => {
        const postCtls = [];
        let previousPostDay = new Date(0);
        const lastViewed = this.props.lastViewedAt;
        let renderedLastViewed = false;
        const currentUserId = this.props.currentUserId;

        for (let i = posts.length - 1; i >= 0; i--) {
            const post = posts[i];

            if (
                post == null ||
                post.type === PostTypes.EPHEMERAL_ADD_TO_CHANNEL ||
                isUserActivityPost(post.type)
            ) {
                continue;
            }

            const postCtl = (
                <Post
                    ref={post.id}
                    key={'post ' + (post.id || post.pending_post_id)}
                    post={post}
                    lastPostCount={(i >= 0 && i < Constants.TEST_ID_COUNT) ? i : -1}
                    getPostList={this.getPostList}
                />
            );

            const currentPostDay = Utils.getDateForUnixTicks(post.create_at);
            if (currentPostDay.toDateString() !== previousPostDay.toDateString()) {
                postCtls.push(
                    <DateSeparator
                        key={currentPostDay}
                        date={currentPostDay}
                    />
                );
            }

            const isNotCurrentUser = post.user_id !== currentUserId || isFromWebhook(post);
            if (isNotCurrentUser &&
                    lastViewed !== 0 &&
                    post.create_at > lastViewed &&
                    !Utils.isPostEphemeral(post) &&
                    !renderedLastViewed) {
                renderedLastViewed = true;

                // Temporary fix to solve ie11 rendering issue
                let newSeparatorId = '';
                if (!UserAgent.isInternetExplorer()) {
                    newSeparatorId = 'new_message_' + post.id;
                }
                postCtls.push(
                    <div
                        id={newSeparatorId}
                        key='unviewed'
                        ref='newMessageSeparator'
                        className='new-separator'
                    >
                        <hr
                            className='separator__hr'
                        />
                        <div className='separator__text'>
                            <FormattedMessage
                                id='posts_view.newMsg'
                                defaultMessage='New Messages'
                            />
                        </div>
                    </div>
                );
            }

            postCtls.push(postCtl);
            previousPostDay = currentPostDay;
        }

        return postCtls;
    }

    getPostList = () => {
        return this.refs.postlist;
    }

    loadOlderPosts = () => {
        const oldestPost = this.props.posts[this.props.posts.length - 1];
        let oldestPostId = oldestPost.id;
        if (oldestPost.type === Posts.POST_TYPES.COMBINED_USER_ACTIVITY) {
            oldestPostId = oldestPost.system_post_ids[0];
        }
        this.props.actions.loadOlderPosts(oldestPostId);
    }

    loadNewerPosts = () => {
        const newestPost = this.props.posts[0];
        let newestPostId = newestPost.id;
        if (newestPost.type === Posts.POST_TYPES.COMBINED_USER_ACTIVITY) {
            newestPostId = newestPost.system_post_ids[0];
        }
        this.props.actions.loadNewerPosts(newestPostId);
    }

    render() {
        const posts = this.props.posts;

        let topRow;
        let bottomRow;

        if (!this.props.olderPosts.allLoaded && !this.props.olderPosts.loading && !this.props.disableLoadingPosts) {
            topRow = (
                <button
                    className='more-messages-text theme style--none color--link'
                    onClick={this.loadOlderPosts}
                >
                    <FormattedMessage
                        id='posts_view.loadMore'
                        defaultMessage='Load more messages'
                    />
                </button>
            );
        }

        if (!this.props.newerPosts.allLoaded && !this.props.newerPosts.loading && !this.props.disableLoadingPosts) {
            bottomRow = (
                <button
                    className='more-messages-text theme style--none color--link'
                    onClick={this.loadNewerPosts}
                >
                    <FormattedMessage
                        id='posts_view.loadMore'
                        defaultMessage='Load more messages'
                    />
                </button>
            );
        }

        return (
            <div>
                {topRow}
                {this.createPosts(posts)}
                {bottomRow}
            </div>
        );
    }
}
