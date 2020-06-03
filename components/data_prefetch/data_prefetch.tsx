// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PQueue from 'p-queue';
import {Channel} from 'mattermost-redux/types/channels';

import {Constants} from 'utils/constants';
import {loadProfilesForSidebar} from 'actions/user_actions.jsx';

const queue = new PQueue({concurrency: 2});

type Props = {
    currentChannelId: string;
    prefetchQueueObj: Record<string, string[]>;
    prefetchRequestStatus: Record<string, any>;
    unreadChannels: Channel[];
    actions: {
        prefetchChannelPosts: (channelId: string, delay: number | undefined) => Promise<any>;
    };
}

export default class DataPrefetch extends React.PureComponent<Props, {}> {
    private prefetchTimeout?: number;

    async componentDidUpdate(prevProps: Props) {
        const {currentChannelId, prefetchQueueObj} = this.props;
        if (!prevProps.currentChannelId && currentChannelId) {
            queue.add(async () => this.prefetchPosts(currentChannelId));
            await loadProfilesForSidebar();
            this.prefetchData();
        } else if (prevProps.prefetchQueueObj !== prefetchQueueObj) {
            clearTimeout(this.prefetchTimeout);
            queue.clear();
            this.prefetchTimeout = window.setTimeout(() => {
                this.prefetchData();
            }, 0);
        }
    }

    public componentWillUnmount(): void {
        clearTimeout(this.prefetchTimeout);
    }

    public prefetchPosts = (channelId: string) => {
        let delay;
        const channel = this.props.unreadChannels.find((unreadChannel) => channelId === unreadChannel.id);
        if (channel && (channel.type === Constants.PRIVATE_CHANNEL || channel.type === Constants.OPEN_CHANNEL)) {
            const isLatestPostInLastMin = (Date.now() - channel.last_post_at) <= 1000;
            if (isLatestPostInLastMin) {
                delay = Math.random() * 1000; // 1ms - 1000ms random wait to not choke server
            }
        }
        return this.props.actions.prefetchChannelPosts(channelId, delay);
    }

    private shouldLoadPriorityQueue = (priority: number, numberOfPiorityRequests: Record<string, number>) => {
        if (priority === 1) {
            return true;
        } else if (priority === 2) {
            return !numberOfPiorityRequests[1];
        }
        return !numberOfPiorityRequests[1] && !numberOfPiorityRequests[2];
    }

    private prefetchData = () => {
        const numberOfPiorityRequests: Record<string, number> = {
            3: 0,
            2: 0,
            1: 0, // high priority requests
        };

        for (let priorityOrder = 1; priorityOrder <= 3; priorityOrder++) {
            const priorityQueue = this.props.prefetchQueueObj[priorityOrder];
            for (let channelIndex = 0; channelIndex < priorityQueue.length; channelIndex++) {
                if (!this.props.prefetchRequestStatus[priorityQueue[channelIndex]] && this.shouldLoadPriorityQueue(priorityOrder, numberOfPiorityRequests)) {
                    const channelId = priorityQueue[channelIndex];
                    numberOfPiorityRequests[priorityOrder]++;
                    queue.add(async () => this.prefetchPosts(channelId));
                }
            }
            numberOfPiorityRequests[priorityOrder] = 0;
        }
    }

    render() {
        return null;
    }
}
