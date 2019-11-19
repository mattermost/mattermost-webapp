// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import * as Utils from 'utils/utils.jsx';
import { Dictionary } from 'mattermost-redux/types/utilities';

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

export function syncronizeChartData(...chartDatas: any[]) {
    const labels: Dictionary<boolean> = {};
    // collect all labels
    chartDatas.forEach(chartData => {
        chartData.labels.forEach((label: string) => labels[label] = true);        
    });
    // fill in missing
    const allLabels = Object.keys(labels);
    chartDatas.forEach(chartData => {
        if (chartData.labels.length > 0) { // don't add to empty graphs
            allLabels.forEach((label: string) => {
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
