// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {FormattedMessage} from 'react-intl';

import {TimeFrame, TimeFrames, TopChannel, TopChannelGraphData} from '@mattermost/types/insights';

import LineChart from 'components/analytics/line_chart';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import './../../../activity_and_insights.scss';

type Props = {
    topChannels: TopChannel[];
    timeFrame: TimeFrame;
    channelLineChartData: TopChannelGraphData;
}

const TopChannelsLineChart = ({topChannels, timeFrame, channelLineChartData}: Props) => {
    const theme = useSelector(getTheme);

    const getLabels = useMemo(() => {
        return Object.keys(channelLineChartData);
    }, [channelLineChartData]);

    const sortGraphData = useMemo(() => {
        const labels = getLabels;
        const values = {} as any;
        for (let i = 0; i < labels.length; i++) {
            const item = channelLineChartData[labels[i]];

            const channelIds = Object.keys(item);

            for (let j = 0; j < channelIds.length; j++) {
                const count = item[channelIds[j]];
                if (values[channelIds[j]]) {
                    values[channelIds[j]].push(count);
                } else {
                    values[channelIds[j]] = [count];
                }
            }
        }
        return {
            labels,
            values,
        };
    }, []);

    const getGraphData = useMemo(() => {
        const data = sortGraphData;
        const dataset = [];

        if (topChannels[0]) {
            dataset.push({
                fillColor: theme.buttonBg,
                borderColor: theme.buttonBg,
                pointBackgroundColor: theme.buttonBg,
                pointBorderColor: theme.buttonBg,
                backgroundColor: 'transparent',
                pointRadius: 0,
                hoverBackgroundColor: theme.buttonBg,
                label: topChannels[0].display_name,
                data: data.values[topChannels[0].id],
                hitRadius: 10,
            });
        }

        if (topChannels[1]) {
            dataset.push({
                fillColor: theme.onlineIndicator,
                borderColor: theme.onlineIndicator,
                pointBackgroundColor: theme.onlineIndicator,
                pointBorderColor: theme.onlineIndicator,
                backgroundColor: 'transparent',
                pointRadius: 0,
                hoverBackgroundColor: theme.onlineIndicator,
                label: topChannels[1].display_name,
                data: data.values[topChannels[1].id],
                hitRadius: 10,
            });
        }

        if (topChannels[2]) {
            dataset.push({
                fillColor: theme.awayIndicator,
                borderColor: theme.awayIndicator,
                pointBackgroundColor: theme.awayIndicator,
                pointBorderColor: theme.awayIndicator,
                backgroundColor: 'transparent',
                pointRadius: 0,
                hoverBackgroundColor: theme.awayIndicator,
                label: topChannels[2].display_name,
                data: data.values[topChannels[2].id],
                hitRadius: 10,
            });
        }

        if (topChannels[3]) {
            dataset.push({
                fillColor: theme.dndIndicator,
                borderColor: theme.dndIndicator,
                pointBackgroundColor: theme.dndIndicator,
                pointBorderColor: theme.dndIndicator,
                backgroundColor: 'transparent',
                pointRadius: 0,
                hoverBackgroundColor: theme.dndIndicator,
                label: topChannels[3].display_name,
                data: data.values[topChannels[3].id],
                hitRadius: 10,
            });
        }

        if (topChannels[4]) {
            dataset.push({
                fillColor: theme.newMessageSeparator,
                borderColor: theme.newMessageSeparator,
                pointBackgroundColor: theme.newMessageSeparator,
                pointBorderColor: theme.newMessageSeparator,
                backgroundColor: 'transparent',
                pointRadius: 0,
                hoverBackgroundColor: theme.newMessageSeparator,
                label: topChannels[4].display_name,
                data: data.values[topChannels[4].id],
                hitRadius: 10,
            });
        }

        return {
            datasets: dataset,
            labels: data.labels,
        };
    }, []);

    return (
        <LineChart
            title={
                <FormattedMessage
                    id='analytics.system.totalBotPosts'
                    defaultMessage='Top Channels'
                />
            }
            id='totalPostsPerChannel'
            options={{
                responsive: true,
                hover: {
                    mode: 'point',
                },
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        gridLines: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            callback(val, index) {
                                // Hide every 4th tick label for 28 day time frame
                                if (timeFrame === TimeFrames.INSIGHTS_28_DAYS) {
                                    return index % 4 === 0 ? val : '';
                                }
                                return val;
                            },
                        },
                    }],
                    yAxes: [{
                        gridLines: {
                            drawOnChartArea: true,
                        },
                        ticks: {
                            maxTicksLimit: 5,
                            beginAtZero: true,
                        },
                    }],
                },
                tooltips: {
                    callbacks: {
                        label(tooltipItem, data) {
                            const index = tooltipItem.datasetIndex;
                            if (typeof index !== 'undefined' && data.datasets && data.datasets[index] && data.datasets[index].label) {
                                return data.datasets[index].label || '';
                            }
                            return '';
                        },
                        title() {
                            return '';
                        },
                        footer(tooltipItem) {
                            return `${tooltipItem[0].value} messages`;
                        },
                    },
                    bodyFontStyle: 'bold',
                    bodyAlign: 'center',
                    footerFontSize: 11,
                    footerAlign: 'center',
                    bodySpacing: 10,
                    footerSpacing: 10,
                },
            }}
            data={getGraphData}
        />
    );
};

export default memo(TopChannelsLineChart);
