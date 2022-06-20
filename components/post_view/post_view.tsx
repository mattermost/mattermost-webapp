// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import LoadingScreen from 'components/loading_screen';

import PostList from './post_list';

interface Props {
    lastViewedAt: number;
    channelLoading: boolean;
    channelId: string;
    focusedPostId?: string;
}

interface State {
    unreadChunkTimeStamp: number;
    loaderForChangeOfPostsChunk: boolean;
    channelLoading: boolean;
}

export default class PostView extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            unreadChunkTimeStamp: props.lastViewedAt,
            loaderForChangeOfPostsChunk: false,
            channelLoading: props.channelLoading,
        };
    }

    static getDerivedStateFromProps(props: Props, state: State) {
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

    changeUnreadChunkTimeStamp = (unreadChunkTimeStamp: number) => {
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

        const Component: any = PostList;
        return (
            <div
                id='post-list'
                role='main'
            >
                <Component
                    unreadChunkTimeStamp={this.state.unreadChunkTimeStamp}
                    channelId={this.props.channelId}
                    changeUnreadChunkTimeStamp={this.changeUnreadChunkTimeStamp}
                    focusedPostId={this.props.focusedPostId}
                />
            </div>
        );
    }
}
