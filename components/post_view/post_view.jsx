// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import LoadingScreen from 'components/loading_screen.jsx';

import PostList from './post_list';

export default class PostView extends React.PureComponent {
    static propTypes = {
        lastViewedAt: PropTypes.number,
        channelLoading: PropTypes.bool,
        channelId: PropTypes.string,
        focusedPostId: PropTypes.string,
    }

    constructor(props) {
        super(props);
        this.state = {
            unreadChunkTimeStamp: props.lastViewedAt,
            loaderForChangeOfPostsChunk: false,
            channelLoading: props.channelLoading,
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (state.unreadChunkTimeStamp === null && props.lastViewedAt) {
            return {
                unreadChunkTimeStamp: props.lastViewedAt,
            };
        }
        if (props.channelLoading !== state.channelLoading) {
            return {
                unreadChunkTimeStamp: props.lastViewedAt,
                channelLoading: props.channelLoading,
            };
        }
        return null;
    }

    changeUnreadChunkTimeStamp = (unreadChunkTimeStamp) => {
        this.setState({
            unreadChunkTimeStamp,
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
                unreadChunkTimeStamp={this.state.unreadChunkTimeStamp}
                channelId={this.props.channelId}
                changeUnreadChunkTimeStamp={this.changeUnreadChunkTimeStamp}
                focusedPostId={this.props.focusedPostId}
            />
        );
    }
}
