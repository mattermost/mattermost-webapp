// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import LoadingScreen from 'components/loading_screen.jsx';

import PostList from './post_list';

export default class PostView extends React.PureComponent {
    static propTypes = {
        lastViewedAt: PropTypes.number,
        isFirstLoad: PropTypes.bool,
        channelLoading: PropTypes.bool,
        channelId: PropTypes.string,
        focusedPostId: PropTypes.string,
    }

    constructor(props) {
        super(props);
        this.state = {
            timeStampToShowPosts: props.isFirstLoad ? props.lastViewedAt : null,
            loaderForChangeOfPostsChunk: false,
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (!state.timeStampToShowPosts && props.lastViewedAt) {
            return {
                timeStampToShowPosts: props.isFirstLoad ? props.lastViewedAt : null,
            };
        }
        return null;
    }

    changeTimeStampToShowPosts = (timeStampToShowPosts) => {
        this.setState({
            timeStampToShowPosts,
            loaderForChangeOfPostsChunk: true,
        }, () => {
            window.requestAnimationFrame(() => {
                this.setState({
                    loaderForChangeOfPostsChunk: false,
                });
            });
        });
    }

    render() {
        if (this.props.channelLoading || this.state.loaderForChangeOfPostsChunk) {
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
            <PostList
                timeStampToShowPosts={this.state.timeStampToShowPosts}
                channelId={this.props.channelId}
                changeTimeStampToShowPosts={this.changeTimeStampToShowPosts}
                isFirstLoad={this.props.isFirstLoad}
                focusedPostId={this.props.focusedPostId}
            />
        );
    }
}
