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
        const labels = Object.keys(channelLineChartData);
        if (timeFrame === TimeFrames.INSIGHTS_1_DAY) {
            for (let i = 0; i < labels.length; i++) {
                let label = labels[i];
                label = `${label.substring(label.indexOf('T') + 1)}:00`;

                labels[i] = label;
            }
        }
        return labels;
    }, [channelLineChartData]);

    const sortGraphData = useMemo(() => {
        const labels = getLabels;

        const values = {} as Record<string, number[]>;
        const keys = Object.keys(channelLineChartData);

        for (let i = 0, len = keys.length; i < len; i++) {
            const item = channelLineChartData[keys[i]];

            const channelIds = Object.keys(item);

            for (let j = 0, channelIdsLength = channelIds.length; j < channelIdsLength; j++) {
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
        const colours = [theme.buttonBg, theme.onlineIndicator, theme.awayIndicator, theme.dndIndicator, theme.newMessageSeparator];

        for (let i = 0; i < 5; i++) {
            if (topChannels[i]) {
                const colour = colours[i];
                dataset.push({
                    fillColor: colour,
                    borderColor: colour,
                    pointBackgroundColor: colour,
                    pointBorderColor: colour,
                    backgroundColor: 'transparent',
                    pointRadius: 0,
                    hoverBackgroundColor: colour,
                    label: topChannels[i].display_name,
                    data: data.values[topChannels[i].id],
                    hitRadius: 10,
                });
            }
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
                            if (typeof index !== 'undefined' && data.datasets && data.datasets[index]?.label) {
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
