// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import LoadingScreen from 'components/loading_screen.jsx';
import {PostRequestTypes} from 'utils/constants.jsx';

import VirtPostList from './post_list_virtualized.jsx';

const MAX_NUMBER_OF_AUTO_RETRIES = 3;
const MAX_EXTRA_PAGES_LOADED = 10;

export default class PostList extends React.PureComponent {
    static propTypes = {

        /**
         *  Array of post ids in the channel, ordered from newest to oldest
         */
        postListIds: PropTypes.array,

        /**
         * The channel the posts are in
         */
        channelId: PropTypes.string,

        /*
         * To get posts for perma view
         */
        focusedPostId: PropTypes.string,

        /*
         * Used for determining if we are not at the recent most chunk in channel
         */
        atLatestPost: PropTypes.bool,

        /*
         * Used for loading posts using unread API
         */
        isFirstLoad: PropTypes.bool,

        /*
         * Used for syncing posts and is also passed down to virt list for newMessages indicator
         */
        latestPostTimeStamp: PropTypes.number,

        /*
         * Used for padding down to virt list so it can change the chunk of posts selected
         */
        changeTimeStampToShowPosts: PropTypes.func.isRequired,
        actions: PropTypes.shape({

            /*
             * Used for getting permalink view posts
             */
            loadPostsAround: PropTypes.func.isRequired,

            /*
             * Used for geting unreads posts
             */
            loadUnreads: PropTypes.func.isRequired,

            /*
             * Used for getting posts using BEFORE_ID and AFTER_ID
             */
            loadPosts: PropTypes.func.isRequired,

            /*
             * Used to set mobile view on resize
             */
            checkAndSetMobileView: PropTypes.func.isRequired,

            /*
             * Used to loading posts since a timestamp to sync the posts
             */
            syncPostsInChannel: PropTypes.func.isRequired,

            /*
             * Used to loading posts if it not first visit, permalink or there exists any postListIds
             * This happens when previous channel visit has a chunk which is not the latest set of posts
             */
            loadLatestPosts: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            newerPosts: {
                loading: false,
                allLoaded: props.atLatestPost,
            },
            olderPosts: {
                loading: false,
                allLoaded: false,
            },
            loadingFirstSetOfPosts: !props.postListIds,
            autoRetryEnable: true,
        };

        this.autoRetriesCount = 0;
        this.actionsForPostList = {
            loadOlderPosts: this.getPostsBefore,
            loadNewerPosts: this.getPostsAfter,
            checkAndSetMobileView: props.actions.checkAndSetMobileView,
            canLoadMorePosts: this.canLoadMorePosts,
            changeTimeStampToShowPosts: props.changeTimeStampToShowPosts,
        };
    }

    componentDidMount() {
        this.mounted = true;
        if (this.props.channelId) {
            this.postsOnLoad(this.props.channelId);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.channelId !== prevProps.channelId) {
            this.postsOnLoad(this.props.channelId);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    postsOnLoad = async (channelId) => {
        if (this.props.focusedPostId) {
            await this.loadPermalinkPosts(channelId);
        } else if (this.props.isFirstLoad) {
            await this.loadUnreadPosts(channelId);
        } else if (this.props.postListIds) {
            await this.props.actions.syncPostsInChannel(channelId, this.props.latestPostTimeStamp);
        } else {
            await this.loadLatestPosts(channelId);
        }

        this.setState({
            loadingFirstSetOfPosts: false,
        });
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
        } else {
            newState = {
                newerPosts: {
                    loading: false,
                    allLoaded: !moreToLoad,
                },
            };
        }

        this.setState(newState);

        if (error) {
            if (this.autoRetriesCount < MAX_NUMBER_OF_AUTO_RETRIES) {
                this.autoRetriesCount++;
                await this.callLoadPosts(channelId, postId, type);
            } else if (this.mounted) {
                this.setState({autoRetryEnable: false});
            }
        } else {
            if (this.mounted) {
                this.setState({autoRetryEnable: true});
            }

            if (!this.state.autoRetryEnable) {
                this.autoRetriesCount = 0;
            }
        }

        return {moreToLoad, error};
    }

    loadPermalinkPosts = async (channelId) => {
        const {atLatestMessage, atOldestmessage} = await this.props.actions.loadPostsAround(channelId, this.props.focusedPostId);
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
    }

    loadUnreadPosts = async (channelId) => {
        const {atLatestMessage, atOldestmessage} = await this.props.actions.loadUnreads(channelId);
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
    }

    loadLatestPosts = async (channelId) => {
        const {atLatestMessage, atOldestmessage} = await this.props.actions.loadLatestPosts(channelId);
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
    }

    canLoadMorePosts = async () => {
        if (this.props.focusedPostId) {
            return;
        }

        if (this.state.loadingFirstSetOfPosts) {
            // Should already be loading posts
            return;
        }

        if (this.state.olderPosts.allLoaded) {
            // Screen is full
            return;
        }

        if (this.state.olderPosts.loading) {
            return;
        }

        if (this.extraPagesLoaded > MAX_EXTRA_PAGES_LOADED) {
            // Prevent this from loading a lot of pages in a channel with only hidden messages
            // Enable load more messages manual link
            this.setState({autoRetryEnable: false});
            return;
        }

        await this.getPostsBefore();
        this.extraPagesLoaded += 1;
    }

    getPostsBefore = (oldestPostId) => {
        this.setLoadingPosts('olderPosts');
        return this.callLoadPosts(this.props.channelId, oldestPostId, PostRequestTypes.BEFORE_ID);
    }

    getPostsAfter = (newestMessageId) => {
        this.setLoadingPosts('newerPosts');
        return this.callLoadPosts(this.props.channelId, newestMessageId, PostRequestTypes.AFTER_ID);
    }

    render() {
        if (this.state.loadingFirstSetOfPosts) {
            return (
                <div id='post-list'>
                    <LoadingScreen
                        position='absolute'
                        key='loading'
                    />
                </div>
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
                            <VirtPostList
                                newerPosts={this.state.newerPosts}
                                olderPosts={this.state.olderPosts}
                                focusedPostId={this.props.focusedPostId}
                                channelId={this.props.channelId}
                                autoRetryEnable={this.state.autoRetryEnable}
                                actions={this.actionsForPostList}
                                postListIds={this.props.postListIds}
                                latestPostTimeStamp={this.props.latestPostTimeStamp}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
