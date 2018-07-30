// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import LoadingScreen from 'components/loading_screen.jsx';
import CreateChannelIntroMessage from 'components/post_view/channel_intro_message';
import Constants, {PostRequestTypes} from 'utils/constants.jsx';
import {getNewestPostIdFromPosts, getOldestPostIdFromPosts} from 'utils/post_utils';

import PostList from './post_list';

const POSTS_PER_PAGE = Constants.POST_CHUNK_SIZE / 2;

export default class PostListWrapper extends React.PureComponent {
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
         * Whether to display the channel intro at full width
         */
        fullWidth: PropTypes.bool,

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
         * Used for taking a backup before clearing from redux-store.
         */
        postIdsInCurrentChannel: PropTypes.array,

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            params: PropTypes.shape({
                messageId: PropTypes.string,
            }).isRequired,
        }).isRequired,

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
             * Used for clearing posts from channel
             */
            clearPostsFromChannel: PropTypes.func.isRequired,

            /*
             * Used for changing posts status of channel
             * For notifying redux store when we hit bottom or top of posts
             */
            changeChannelPostsStatus: PropTypes.func.isRequired,

            /*
             * Used for taking backup of postsInChannel before clearing so,
             * we can use it incase of failure in loading posts
             */
            backUpPostsInChannel: PropTypes.func.isRequired,

            /*
             * Used for notifying redux store on channel sync complete
             */
            channelSyncCompleted: PropTypes.func.isRequired,

            /*
             * Used for adding back postIds to postsInChannel from backUpPostsInChannel
             */
            addPostIdsFromBackUp: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            isDoingInitialLoad: this.shouldLoadPosts(props),
            newerPosts: {
                loading: false,
                allLoaded: (props.channelPostsStatus && props.channelPostsStatus.atEnd) || false,
            },
            olderPosts: {
                loading: false,
                allLoaded: PostListWrapper.oldestMessageLoadedInView(props),
            },
            lastViewedAt: props.lastViewedAt,
            posts: this.props.posts,
        };
    }

    componentDidMount() {
        if (this.state.isDoingInitialLoad) {
            this.postsOnLoad(this.props.channelId);
        }
        if (!this.props.channelSyncStatus && this.props.channelPostsStatus) {
            this.syncPosts(this.props);
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.posts && nextProps.posts && (prevState.posts.length !== nextProps.posts.length)) {
            if (PostListWrapper.oldestMessageLoadedInView(nextProps) !== prevState.olderPosts.allLoaded) {
                return {
                    olderPosts: {
                        loading: false,
                        allLoaded: PostListWrapper.oldestMessageLoadedInView(nextProps),
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
            this.syncPosts(this.props);
        }
    }

    shouldLoadPosts(props) {
        if (!props.channelPostsStatus) {
            return true;
        } else if ((props.match.params.messageId && !props.channelPostsStatus.atEnd) || !props.channelPostsStatus.atEnd) {
            return true;
        }

        return false;
    }

    syncPosts = async (props) => {
        if (props.channelPostsStatus.atEnd) {
            await props.actions.syncChannelPosts({channelId: props.channelId, since: props.socketStatus.lastDisconnectAt});
        } else {
            let data;
            const oldestPostId = getOldestPostIdFromPosts(props.posts);
            let newestMessageId = getNewestPostIdFromPosts(props.posts);
            do {
                ({data} = await props.actions.syncChannelPosts({channelId: props.channelId, beforeId: newestMessageId})); // eslint-disable-line no-await-in-loop
                newestMessageId = data.order[data.order.length - 1];
            } while (data && !data.posts[oldestPostId]);
        }
        props.actions.channelSyncCompleted(props.channeId);
    }

    storePostsIdsAndClear() {
        if (this.props.posts.length) {
            this.props.actions.backUpPostsInChannel(this.props.channelId, this.props.postIdsInCurrentChannel);
            this.props.actions.clearPostsFromChannel(this.props.channelId);
        }
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
        try {
            if (this.props.match.params.messageId) {
                await this.loadPermalinkPosts(channelId);
            } else if (!this.props.channelPostsStatus) { //eslint-disable-line no-negated-condition
                await this.loadUnreadPosts(channelId);
            } else {
                this.storePostsIdsAndClear();
                await this.loadUnreadPosts(channelId);
            }
            this.props.actions.channelSyncCompleted(channelId);
        } catch (e) {
            this.props.actions.addPostIdsFromBackUp(channelId);
        } finally {
            this.setState({
                isDoingInitialLoad: false,
            });
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
        const morePostsExist = await this.props.actions.loadPosts({
            channelId,
            postId,
            type,
        });

        if (type === PostRequestTypes.BEFORE_ID) {
            newState = {
                olderPosts: {
                    loading: false,
                    allLoaded: !morePostsExist,
                },
            };
            this.changeChannelPostsStatus({atStart: !morePostsExist});
        } else {
            newState = {
                newerPosts: {
                    loading: false,
                    allLoaded: !morePostsExist,
                },
            };
            this.changeChannelPostsStatus({atEnd: !morePostsExist});
        }

        this.setState(newState);
    }

    loadPermalinkPosts = async (channelId) => {
        const getPostThread = this.props.actions.getPostThread(this.props.match.params.messageId, false);

        const afterPosts = this.callLoadPosts(channelId, this.props.match.params.messageId, PostRequestTypes.AFTER_ID);
        const beforePosts = this.callLoadPosts(channelId, this.props.match.params.messageId, PostRequestTypes.BEFORE_ID);

        await beforePosts;
        await afterPosts;
        await getPostThread;
    }

    loadUnreadPosts = async (channelId) => {
        let atLatestMessage = false;
        let atOldestmessage = false;

        const {data, error} = await this.props.actions.loadUnreads(channelId);

        if (error) {
            throw new Error();
        }

        // API returns 2*POSTS_PER_PAGE and if it less than 1*POSTS_PER_PAGE then we loaded all the posts.
        if (data && Object.keys(data.posts).length < POSTS_PER_PAGE) {
            atLatestMessage = true;
            atOldestmessage = true;
        } else {
            const postsArray = data.order.map((id) => data.posts[id]);
            const unreadCount = this.getUnreadPostsCount(postsArray, this.props.currentUserId);
            if (unreadCount < 30) {
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

    getPostsBefore = async (postId) => {
        this.setLoadingPosts('olderPosts');
        await this.callLoadPosts(this.props.channelId, postId, PostRequestTypes.BEFORE_ID);
    }

    getPostsAfter = async (postId) => {
        this.setLoadingPosts('newerPosts');
        await this.callLoadPosts(this.props.channelId, postId, PostRequestTypes.AFTER_ID);
    }

    getUnreadPostsCount = (posts, currentUserId) => {
        //This can be different than the unreadCount on the sidebar as sytem messages
        //are not considered for the count.
        return posts.reduce((count, post) => {
            if (post.create_at > this.state.lastViewedAt &&
                post.user_id !== currentUserId &&
                post.state !== Constants.POST_DELETED) {
                return count + 1;
            }
            return count;
        }, 0);
    }

    // used for click on new messages indicator
    // got to latest if channel is not atEnd.
    // else scroll to bottom
    goToLatestPosts = () => {
        this.storePostsIdsAndClear();
        this.loadUnreadPosts(this.props.channelId);
    }

    render() {
        const posts = this.props.posts || [];
        let postList;
        let topRow;
        let bottomRow;
        let disableLoadingPosts = false;

        if (posts.length === 0 && this.state.isDoingInitialLoad) {
            return (
                <div id='post-list'>
                    <LoadingScreen
                        position='absolute'
                        key='loading'
                    />
                </div>
            );
        }

        if (this.props.postVisibility >= Constants.MAX_POST_VISIBILITY) {
            const cannotLoadMoreMessages = (
                <div className='post-list__loading post-list__loading-search'>
                    <FormattedMessage
                        id='posts_view.maxLoaded'
                        defaultMessage='Looking for a specific message? Try searching for it'
                    />
                </div>
            );

            if (this.state.olderPosts.allLoaded) {
                bottomRow = cannotLoadMoreMessages;
            } else if (this.state.newerPosts.allLoaded) {
                topRow = cannotLoadMoreMessages;
            } else {
                topRow = cannotLoadMoreMessages;
                bottomRow = cannotLoadMoreMessages;
            }

            disableLoadingPosts = true;
        }

        if (this.state.olderPosts.allLoaded) {
            topRow = (
                <CreateChannelIntroMessage
                    fullWidth={this.props.fullWidth}
                />
            );
        }

        if (posts.length && !this.state.isDoingInitialLoad) {
            postList = (
                <PostList
                    posts={this.props.posts}
                    fullWidth={this.props.fullWidth}
                    actions={{
                        loadOlderPosts: this.getPostsBefore,
                        loadNewerPosts: this.getPostsAfter,
                    }}
                    newerPosts={this.state.newerPosts}
                    olderPosts={this.state.olderPosts}
                    disableLoadingPosts={disableLoadingPosts}
                    lastViewedAt={this.state.lastViewedAt}
                    currentUserId={this.props.currentUserId}
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
                            {topRow}
                            {postList}
                            {bottomRow}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
