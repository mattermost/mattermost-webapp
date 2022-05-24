// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';

import {FormattedMessage} from 'react-intl';

import Constants, {InsightsScopes} from 'utils/constants';

import CircleLoader from '../skeleton_loader/circle_loader/circle_loader';
import TitleLoader from '../skeleton_loader/title_loader/title_loader';
import LineChartLoader from '../skeleton_loader/line_chart_loader/line_chart_loader';
import widgetHoc, {WidgetHocProps} from '../widget_hoc/widget_hoc';

import {getCurrentRelativeTeamUrl, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getMyTopChannels, getTopChannelsForTeam} from 'mattermost-redux/actions/insights';
import {TimeFrames, TopChannel, TopChannelGraphData} from '@mattermost/types/insights';
import WidgetEmptyState from '../widget_empty_state/widget_empty_state';
import OverlayTrigger from 'components/overlay_trigger';

import LineChart from 'components/analytics/line_chart';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import Tooltip from 'components/tooltip';

import './../../activity_and_insights.scss';

const TopChannels = (props: WidgetHocProps) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [topChannels, setTopChannels] = useState([] as TopChannel[]);
    const [channelLineChartData] = useState({
        '2022-05-01': {
            i3kena4xkiru8grub5nftprfbr: 93,
            j98i9uwz4fgsjjknyixc5qs7no: 114,
            d33nuk9mftyi9moy8xjujpmegr: 324,
            f4fdzjpzhtnp3n6w87gak883iw: 342,
            '4fpa8crxji89zryzit9kquocdw': 169,
        },
        '2022-05-02': {
            i3kena4xkiru8grub5nftprfbr: 203,
            j98i9uwz4fgsjjknyixc5qs7no: 14,
            d33nuk9mftyi9moy8xjujpmegr: 304,
            f4fdzjpzhtnp3n6w87gak883iw: 267,
            '4fpa8crxji89zryzit9kquocdw': 109,
        },
        '2022-05-03': {
            i3kena4xkiru8grub5nftprfbr: 230,
            j98i9uwz4fgsjjknyixc5qs7no: 140,
            d33nuk9mftyi9moy8xjujpmegr: 340,
            f4fdzjpzhtnp3n6w87gak883iw: 190,
            '4fpa8crxji89zryzit9kquocdw': 110,
        },
        '2022-05-04': {
            i3kena4xkiru8grub5nftprfbr: 123,
            j98i9uwz4fgsjjknyixc5qs7no: 114,
            d33nuk9mftyi9moy8xjujpmegr: 134,
            f4fdzjpzhtnp3n6w87gak883iw: 100,
            '4fpa8crxji89zryzit9kquocdw': 219,
        },
        '2022-05-05': {
            i3kena4xkiru8grub5nftprfbr: 430,
            j98i9uwz4fgsjjknyixc5qs7no: 119,
            d33nuk9mftyi9moy8xjujpmegr: 234,
            f4fdzjpzhtnp3n6w87gak883iw: 160,
            '4fpa8crxji89zryzit9kquocdw': 284,
        },
        '2022-05-06': {
            i3kena4xkiru8grub5nftprfbr: 123,
            j98i9uwz4fgsjjknyixc5qs7no: 114,
            d33nuk9mftyi9moy8xjujpmegr: 134,
            f4fdzjpzhtnp3n6w87gak883iw: 100,
            '4fpa8crxji89zryzit9kquocdw': 219,
        },
        '2022-05-07': {
            i3kena4xkiru8grub5nftprfbr: 203,
            j98i9uwz4fgsjjknyixc5qs7no: 14,
            d33nuk9mftyi9moy8xjujpmegr: 304,
            f4fdzjpzhtnp3n6w87gak883iw: 267,
            '4fpa8crxji89zryzit9kquocdw': 109,
        },
    } as TopChannelGraphData);

    const currentTeamId = useSelector(getCurrentTeamId);
    const theme = useSelector(getTheme);
    const currentTeamUrl = useSelector(getCurrentRelativeTeamUrl);

    const getTopTeamChannels = useCallback(async () => {
        if (props.filterType === InsightsScopes.TEAM) {
            setLoading(true);
            const data: any = await dispatch(getTopChannelsForTeam(currentTeamId, 0, 5, props.timeFrame));
            if (data.data && data.data.items) {
                setTopChannels(data.data.items);
            }
            setLoading(false);
        }
    }, [props.timeFrame, currentTeamId, props.filterType]);

    useEffect(() => {
        getTopTeamChannels();
    }, [getTopTeamChannels]);

    const getMyTeamChannels = useCallback(async () => {
        if (props.filterType === InsightsScopes.MY) {
            setLoading(true);
            const data: any = await dispatch(getMyTopChannels(currentTeamId, 0, 5, props.timeFrame));
            if (data.data && data.data.items) {
                setTopChannels(data.data.items);
            }
            setLoading(false);
        }
    }, [props.timeFrame, props.filterType]);

    useEffect(() => {
        getMyTeamChannels();
    }, [getMyTeamChannels]);

    const skeletonTitle = useCallback(() => {
        const titles = [];
        for (let i = 0; i < 5; i++) {
            titles.push(
                <div
                    className='top-channel-loading-row'
                    key={i}
                >
                    <CircleLoader
                        size={16}
                    />
                    <TitleLoader/>
                </div>,
            );
        }
        return titles;
    }, []);

    const getLabels = useMemo(() => {
        return Object.keys(channelLineChartData);
    }, [channelLineChartData]);

    const sortGraphData = () => {
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
    };

    const getGraphData = () => {
        const data = sortGraphData();
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
    };
    const tooltip = useCallback((messageCount: number) => {
        return (
            <Tooltip
                id='total-messages'
            >
                <FormattedMessage
                    id='insights.topChannels.messageCount'
                    defaultMessage='{messageCount} total messages'
                    values={{
                        messageCount,
                    }}
                />
            </Tooltip>
        );
    }, []);

    return (
        <>
            <div className='top-channel-container'>
                <div className='top-channel-line-chart'>
                    {
                        loading &&
                        <LineChartLoader/>
                    }
                    {
                        (!loading && topChannels.length !== 0) &&
                        <>
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
                                                callback: function(val, index) {
                                                    // Hide every 4th tick label for 28 day time frame
                                                    if (props.timeFrame === TimeFrames.INSIGHTS_28_DAYS) {
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
                                data={getGraphData()}
                            />
                        </>
                    }
                </div>
                <div className='top-channel-list'>
                    {
                        loading &&
                        skeletonTitle()
                    }
                    {
                        (!loading && topChannels.length !== 0) &&
                        <div className='channel-list'>
                            {
                                topChannels.map((channel) => {
                                    const barSize = ((channel.message_count / topChannels[0].message_count) * 0.8);

                                    let iconToDisplay = <i className='icon icon-globe'/>;

                                    if (channel.type === Constants.PRIVATE_CHANNEL) {
                                        iconToDisplay = <i className='icon icon-lock-outline'/>;
                                    }
                                    return (
                                        <Link
                                            className='channel-row'
                                            to={`${currentTeamUrl}/channels/${channel.name}`}
                                            key={channel.id}
                                        >
                                            <div
                                                className='channel-display-name'
                                            >
                                                <span className='icon'>
                                                    {iconToDisplay}
                                                </span>
                                                <span className='display-name'>{channel.display_name}</span>
                                            </div>
                                            <div className='channel-message-count'>
                                                <OverlayTrigger
                                                    trigger={['hover']}
                                                    delayShow={Constants.OVERLAY_TIME_DELAY}
                                                    placement='right'
                                                    overlay={tooltip(channel.message_count)}
                                                >
                                                    <span className='message-count'>{channel.message_count}</span>
                                                </OverlayTrigger>
                                                <span
                                                    className='horizontal-bar'
                                                    style={{
                                                        flex: `${barSize} 0`,
                                                    }}
                                                />
                                            </div>
                                        </Link>
                                    );
                                })
                            }
                        </div>
                    }
                </div>
            </div>
            {
                (topChannels.length === 0 && !loading) &&
                <WidgetEmptyState
                    icon={'globe'}
                />
            }
        </>

    );
};

export default memo(widgetHoc(TopChannels));
