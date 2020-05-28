// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PQueue from 'p-queue';
import PropTypes from 'prop-types';

import {loadProfilesForSidebar} from 'actions/user_actions.jsx';

const queue = new PQueue({concurrency: 2});

export default class DataPrefetch extends React.PureComponent {
    static propTypes = {
        currentChannelId: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            prefetchChannelPosts: PropTypes.func.isRequired,
        }),
        prefetchQueueObj: PropTypes.object,
        prefetchRequestStatus: PropTypes.object,
    }

    async componentDidUpdate(prevProps) {
        if (!prevProps.currentChannelId && this.props.currentChannelId) {
            queue.add(async () => this.prefetchPosts(this.props.currentChannelId));
            await loadProfilesForSidebar();
            this.prefetchData();
        } else if (prevProps.prefetchQueueObj !== this.props.prefetchQueueObj) {
            clearTimeout(this.prefetchTimeout);
            queue.clear();
            this.prefetchTimeout = setTimeout(() => {
                this.prefetchData();
            }, 0);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.prefetchTimeout);
    }

    prefetchPosts = (channelId) => {
        return this.props.actions.prefetchChannelPosts(channelId);
    }

    shouldLoadPriorityQueue = (priority, numberOfPiorityRequests) => {
        if (priority === 1) {
            return true;
        } else if (priority === 2) {
            return !numberOfPiorityRequests[1];
        }
        return !numberOfPiorityRequests[1] && !numberOfPiorityRequests[2];
    }

    prefetchData = () => {
        const numberOfPiorityRequests = {
            3: 0,
            2: 0,
            1: 0, // high priority requests
        };

        for (let priorityOrder = 1; priorityOrder <= 3; priorityOrder++) {
            const priorityQueue = this.props.prefetchQueueObj[priorityOrder];
            for (let channelIndex = 0; channelIndex < priorityQueue.length; channelIndex++) {
                if (!this.props.prefetchRequestStatus[priorityQueue[channelIndex]] && this.shouldLoadPriorityQueue(priorityOrder, numberOfPiorityRequests)) {
                    numberOfPiorityRequests[priorityOrder]++;
                    queue.add(async () => this.prefetchPosts(priorityQueue[channelIndex]));
                }
            }
            numberOfPiorityRequests[priorityOrder] = 0;
        }
    }

    render() {
        return null;
    }
}
