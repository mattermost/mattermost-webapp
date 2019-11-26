// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Dictionary} from 'mattermost-redux/types/utilities';

import * as Utils from 'utils/utils.jsx';

export function formatChannelDoughtnutData(totalPublic: any, totalPrivate: any) {
    const channelTypeData = {
        labels: [
            Utils.localizeMessage('analytics.system.publicChannels', 'Public Channels'),
            Utils.localizeMessage('analytics.system.privateGroups', 'Private Channels'),
        ],
        datasets: [{
            data: [totalPublic, totalPrivate],
            backgroundColor: ['#46BFBD', '#FDB45C'],
            hoverBackgroundColor: ['#5AD3D1', '#FFC870'],
        }],
    };

    return channelTypeData;
}

export function formatPostDoughtnutData(filePosts: any, hashtagPosts: any, totalPosts: any) {
    const postTypeData = {
        labels: [
            Utils.localizeMessage('analytics.system.totalFilePosts', 'Posts with Files'),
            Utils.localizeMessage('analytics.system.totalHashtagPosts', 'Posts with Hashtags'),
            Utils.localizeMessage('analytics.system.textPosts', 'Posts with Text-only'),
        ],
        datasets: [{
            data: [filePosts, hashtagPosts, (totalPosts - filePosts - hashtagPosts)],
            backgroundColor: ['#46BFBD', '#F7464A', '#FDB45C'],
            hoverBackgroundColor: ['#5AD3D1', '#FF5A5E', '#FFC870'],
        }],
    };

    return postTypeData;
}

export function formatPostsPerDayData(data: any) {
    const chartData = {
        labels: [] as any,
        datasets: [{
            fillColor: 'rgba(151,187,205,0.2)',
            borderColor: 'rgba(151,187,205,1)',
            pointBackgroundColor: 'rgba(151,187,205,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(151,187,205,1)',
            data: [] as any,
        }],
    };

    for (const index in data) {
        if (data[index]) {
            const row = data[index];
            chartData.labels.push(row.name);
            chartData.datasets[0].data.push(row.value);
        }
    }

    return chartData;
}

// synchronizeChartData converges on a uniform set of labels for all entries in the given chart data. If a given label wasn't already present in the chart data, a 0-valued data point at that label is added.
//
// For date-labelled charts, this ensures that each charts starts and ends on the same interval, even if data for part of that interval was never collected.
export function synchronizeChartData(...chartDatas: any[]) {
    const labels: Set<string> = new Set();

    // collect all labels
    chartDatas.forEach((chartData) => {
        chartData.labels.forEach((label: string) => labels.add(label));
    });

    // fill in missing
    chartDatas.forEach((chartData) => {
        if (chartData.labels.length > 0) { // don't add to empty graphs
            labels.forEach((label: string) => {
                if (chartData.labels.indexOf(label) === -1) {
                    chartData.labels.push(label);
                    chartData.datasets[0].data.push(0);
                }
            });
        }
    });
}

export function formatUsersWithPostsPerDayData(data: any) {
    const chartData = {
        labels: [] as any,
        datasets: [{
            label: '',
            fillColor: 'rgba(151,187,205,0.2)',
            borderColor: 'rgba(151,187,205,1)',
            pointBackgroundColor: 'rgba(151,187,205,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(151,187,205,1)',
            data: [] as any,
        }],
    };

    for (const index in data) {
        if (data[index]) {
            const row = data[index];
            chartData.labels.push(row.name);
            chartData.datasets[0].data.push(row.value);
        }
    }

    return chartData;
}
