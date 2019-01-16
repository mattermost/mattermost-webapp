// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {getNewestPostIdFromPosts, getOldestPostIdFromPosts} from 'mattermost-redux/utils/post_utils';

import LoadingScreen from 'components/loading_screen.jsx';
import Constants, {PostRequestTypes} from 'utils/constants.jsx';

import PostList from './post_list.jsx';

const POSTS_PER_PAGE = Constants.POST_CHUNK_SIZE / 2;

export default class PostView extends React.PureComponent {
    static propTypes = {

        /**
         * Array of posts in the channel, ordered from newest to oldest
         */
        posts: PropTypes.array,

        /**
         * The channel the posts are in
         */
        channelId: PropTypes.string,

        /**
         * Used for disabling loading more messages
         */
        postVisibility: PropTypes.number,

        /**
         * Used for showing more message indicators and channel intro message
         */
        channelPostsStatus: PropTypes.object,

        /**
         * Used for unread count
         */
        currentUserId: PropTypes.string,

        /**
         * Used for unread count
         */
        lastViewedAt: PropTypes.number,

        /**
         * Flag used to determine if channel has to call sync actions.
         */
        channelSyncStatus: PropTypes.bool,

        /**
         * Used for websocket connect change to trigger sync.
         */
        socketStatus: PropTypes.object,

        /**
         * Used for determining if we reached to the top of channel.
         */
        postIdsInCurrentChannel: PropTypes.array,

        /*
         * To get posts for perma view
         */
        focusedPostId: PropTypes.string,

        actions: PropTypes.shape({

            /*
             * Get post for permaview
             */
            getPostThread: PropTypes.func.isRequired,

            /*
             * Get unreads posts onload
             */
            loadUnreads: PropTypes.func.isRequired,

            /*
             * Get posts using BEFORE_ID and AFTER_ID
             */
            loadPosts: PropTypes.func.isRequired,

            /*
             * Used for changing posts status of channel
             * For notifying redux store when we hit bottom or top of posts
             */
            changeChannelPostsStatus: PropTypes.func.isRequired,

            /*
             * Used for notifying redux store on channel sync complete
             */
            channelSyncCompleted: PropTypes.func.isRequired,

            /*
             * Used to sync when channel is out of sync because of socket disconnect
             */
            syncChannelPosts: PropTypes.func.isRequired,

            /*
             * Used to set mobile view on resize
             */
            checkAndSetMobileView: PropTypes.func.isRequired,

        }).isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            newerPosts: {
                loading: false,
                allLoaded: (props.channelPostsStatus && props.channelPostsStatus.atEnd) || false,
            },
            olderPosts: {
                loading: false,
                allLoaded: PostView.oldestMessageLoadedInView(props),
            },
            posts: this.props.posts,
        };
    }

    componentDidMount() {
        if (this.shouldLoadPosts(this.props)) {
            this.postsOnLoad(this.props.channelId);
        }
        if (!this.props.channelSyncStatus && this.props.channelPostsStatus) {
            this.syncChannelPosts(this.props);
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.posts && nextProps.posts && (prevState.posts.length !== nextProps.posts.length)) {
            if (PostView.oldestMessageLoadedInView(nextProps) !== prevState.olderPosts.allLoaded) {
                return {
                    olderPosts: {
                        loading: false,
                        allLoaded: PostView.oldestMessageLoadedInView(nextProps),
                    },
                    posts: nextProps.posts,
                };
            }
            return {
                posts: nextProps.posts,
            };
        }
        return null;
    }

    componentDidUpdate(prevProps) {
        if (this.props.socketStatus && this.props.socketStatus.connected && !prevProps.socketStatus.connected) {
            this.syncChannelPosts(this.props);
        }
    }

    shouldLoadPosts(props) {
        if (!props.channelPostsStatus || !props.channelPostsStatus.atEnd || props.focusedPostId) {
            return true;
        }

        return false;
    }

    syncChannelPosts = ({channelId, channelPostsStatus, socketStatus, posts}) => {
        this.props.actions.syncChannelPosts({
            channelId,
            channelPostsStatus,
            posts,
            lastDisconnectAt: socketStatus.lastDisconnectAt,
        });
    }

    static oldestMessageLoadedInView({postIdsInCurrentChannel, posts, channelPostsStatus}) {
        if (channelPostsStatus && channelPostsStatus.atStart) {
            if (postIdsInCurrentChannel && postIdsInCurrentChannel[postIdsInCurrentChannel.length - 1] === posts[posts.length - 1].id) {
                return true;
            }
        }
        return false;
    }

    postsOnLoad = async (channelId) => {
        if (this.props.focusedPostId) {
            await this.loadPermalinkPosts(channelId);
        } else {
            await this.loadUnreadPosts(channelId);
            this.props.actions.channelSyncCompleted(channelId);
        }
    }

    setLoadingPosts = (type) => {
        this.setState({
            [type]: {
                ...this.state[type],
                loading: true,
            },
        });
    }

    callLoadPosts = async (channelId, postId, type) => {
        let newState = {};
        const {moreToLoad, error} = await this.props.actions.loadPosts({
            channelId,
            postId,
            type,
        });

        if (type === PostRequestTypes.BEFORE_ID) {
            newState = {
                olderPosts: {
                    loading: false,
                    allLoaded: !moreToLoad,
                },
            };
            this.changeChannelPostsStatus({atStart: !moreToLoad});
        } else {
            newState = {
                newerPosts: {
                    loading: false,
                    allLoaded: !moreToLoad,
                },
            };
            this.changeChannelPostsStatus({atEnd: !moreToLoad});
        }

        this.setState(newState);
        return {moreToLoad, error};
    }

    loadPermalinkPosts = (channelId) => {
        const getPostThread = this.props.actions.getPostThread(this.props.focusedPostId, false);
        const afterPosts = this.callLoadPosts(channelId, this.props.focusedPostId, PostRequestTypes.AFTER_ID);
        const beforePosts = this.callLoadPosts(channelId, this.props.focusedPostId, PostRequestTypes.BEFORE_ID);
        return Promise.all([
            beforePosts,
            afterPosts,
            getPostThread,
        ]);
    }

    loadUnreadPosts = async (channelId) => {
        let atLatestMessage = false;
        let atOldestmessage = false;

        const {data} = await this.props.actions.loadUnreads(channelId);

        // API returns 2*POSTS_PER_PAGE and if it less than 1*POSTS_PER_PAGE then we loaded all the posts.
        if (data && Object.keys(data.posts).length < POSTS_PER_PAGE) {
            atLatestMessage = true;
            atOldestmessage = true;
        } else {
            const postsArray = data.order.map((id) => data.posts[id]);
            const unreadCount = this.getUnreadPostsCount(postsArray, this.props.currentUserId);
            if (unreadCount < POSTS_PER_PAGE) {
                atLatestMessage = true;
            }
        }

        this.setState({
            olderPosts: {
                loading: false,
                allLoaded: atOldestmessage,
            },
            newerPosts: {
                loading: false,
                allLoaded: atLatestMessage,
            },
        });

        this.changeChannelPostsStatus({atEnd: atLatestMessage});
        this.changeChannelPostsStatus({atStart: atOldestmessage});
    }

    changeChannelPostsStatus = (status) => {
        this.props.actions.changeChannelPostsStatus({
            channelId: this.props.channelId,
            ...status,
        });
    }

    getPostsBefore = () => {
        this.setLoadingPosts('olderPosts');
        const oldestPostId = getOldestPostIdFromPosts(this.props.posts);
        return this.callLoadPosts(this.props.channelId, oldestPostId, PostRequestTypes.BEFORE_ID);
    }

    getPostsAfter = () => {
        this.setLoadingPosts('newerPosts');
        const newestMessageId = getNewestPostIdFromPosts(this.props.posts);
        return this.callLoadPosts(this.props.channelId, newestMessageId, PostRequestTypes.AFTER_ID);
    }

    getUnreadPostsCount = (posts, currentUserId) => {
        //This can be different than the unreadCount on the sidebar as sytem messages
        //are not considered for the count.
        return posts.reduce((count, post) => {
            if (post.create_at > this.props.lastViewedAt &&
                post.user_id !== currentUserId &&
                post.state !== Constants.POST_DELETED) {
                return count + 1;
            }
            return count;
        }, 0);
    }

    render() {
        const posts = this.props.posts;
        let postList;

        if (!posts) {
            return (
                <div id='post-list'>
                    <LoadingScreen
                        position='absolute'
                        key='loading'
                    />
                </div>
            );
        }

        if (posts.length) {
            postList = (
                <PostList
                    posts={this.props.posts}
                    loadOlderPosts={this.getPostsBefore}
                    loadNewerPosts={this.getPostsAfter}
                    newerPosts={this.state.newerPosts}
                    olderPosts={this.state.olderPosts}
                    lastViewedAt={this.props.lastViewedAt}
                    currentUserId={this.props.currentUserId}
                    focusedPostId={this.props.focusedPostId}
                    postVisibility={this.props.postVisibility}
                    checkAndSetMobileView={this.props.actions.checkAndSetMobileView}
                />
            );
        }
        return (
            <div id='post-list'>
                <div
                    ref='postlist'
                    className='post-list-holder-by-time'
                    key={'postlist-' + this.props.channelId}
                >
                    <div className='post-list__table'>
                        <div
                            id='postListContent'
                            ref='postListContent'
                            className='post-list__content'
                        >
                            {postList}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
