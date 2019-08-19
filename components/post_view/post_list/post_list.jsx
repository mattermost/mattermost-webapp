// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import LoadingScreen from 'components/loading_screen.jsx';
import {PostRequestTypes} from 'utils/constants.jsx';
import {getOldestPostId, getLatestPostId} from 'utils/post_utils.jsx';

import VirtPostList from './post_list_virtualized.jsx';

const MAX_NUMBER_OF_AUTO_RETRIES = 3;
export const MAX_EXTRA_PAGES_LOADED = 10;

export default class PostList extends React.PureComponent {
    static propTypes = {

        /**
         *  Array of formatted post ids in the channel
         *  This will be different from postListIds because of grouping and filtering of posts
         *  This array should be used for making Before and After API calls
         */
        formattedPostIds: PropTypes.array,

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

        latestAriaLabelFunc: PropTypes.func,

        /*
         * Used for padding down to virt list so it can change the chunk of posts selected
         */
        changeUnreadChunkTimeStamp: PropTypes.func.isRequired,
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
            autoRetryEnable: true,
        };

        this.autoRetriesCount = 0;
        this.loadingMorePosts = null;
        this.actionsForPostList = {
            loadOlderPosts: this.getPostsBefore,
            loadNewerPosts: this.getPostsAfter,
            checkAndSetMobileView: props.actions.checkAndSetMobileView,
            canLoadMorePosts: this.canLoadMorePosts,
            changeUnreadChunkTimeStamp: props.changeUnreadChunkTimeStamp,
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
        let error;
        let atOldestmessage;
        let atLatestMessage;
        if (this.props.focusedPostId) {
            ({atLatestMessage, atOldestmessage, error} = await this.props.actions.loadPostsAround(channelId, this.props.focusedPostId));
        } else if (this.props.isFirstLoad) {
            ({atLatestMessage, atOldestmessage, error} = await this.props.actions.loadUnreads(channelId));
        } else if (this.props.latestPostTimeStamp) {
            ({error} = await this.props.actions.syncPostsInChannel(channelId, this.props.latestPostTimeStamp));
        } else {
            ({atLatestMessage, atOldestmessage, error} = await this.props.actions.loadLatestPosts(channelId));
        }

        if (error) {
            // leave the loader if it exists as it is
            return;
        }

        // atLatestMessage does not exist for syncPostsInChannel call
        // We dont need to setState on syncPostsInChannel call as the loader does not exist and atLatestMessage state will be taken care by the prop
        if (typeof atLatestMessage !== 'undefined') {
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

    getOldestVisiblePostId = () => {
        return getOldestPostId(this.props.postListIds);
    }

    getLatestVisiblePostId = () => {
        return getLatestPostId(this.props.postListIds);
    }

    canLoadMorePosts = async (type = PostRequestTypes.BEFORE_ID) => {
        if (!this.props.postListIds) {
            return;
        }

        if (this.state.olderPosts.loading || this.state.newerPosts.loading) {
            return;
        }

        if (this.extraPagesLoaded > MAX_EXTRA_PAGES_LOADED) {
            // Prevent this from loading a lot of pages in a channel with only hidden messages
            // Enable load more messages manual link
            if (this.state.autoRetryEnable) {
                this.setState({autoRetryEnable: false});
            }
            return;
        }

        if (!this.state.olderPosts.allLoaded && type === PostRequestTypes.BEFORE_ID) {
            const oldestPostId = this.getOldestVisiblePostId();
            await this.getPostsBefore(oldestPostId);
        } else if (!this.state.newerPosts.allLoaded) {
            // if all olderPosts are loaded load new ones
            const latestPostId = this.getLatestVisiblePostId();
            await this.getPostsAfter(latestPostId);
        }

        this.extraPagesLoaded += 1;
    }

    getPostsBefore = async () => {
        if (this.state.olderPosts.loading) {
            return;
        }
        const oldestPostId = this.getOldestVisiblePostId();
        this.setLoadingPosts('olderPosts');
        await this.callLoadPosts(this.props.channelId, oldestPostId, PostRequestTypes.BEFORE_ID);
    }

    getPostsAfter = async () => {
        if (this.state.newerPosts.loading) {
            return;
        }
        const latestPostId = this.getLatestVisiblePostId();
        this.setLoadingPosts('newerPosts');
        await this.callLoadPosts(this.props.channelId, latestPostId, PostRequestTypes.AFTER_ID);
    }

    render() {
        if (!this.props.postListIds) {
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
                            id='virtualizedPostListContent'
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
                                postListIds={this.props.formattedPostIds}
                                latestPostTimeStamp={this.props.latestPostTimeStamp}
                                latestAriaLabelFunc={this.props.latestAriaLabelFunc}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
