// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import Constants, {InsightsScopes} from 'utils/constants';

import CircleLoader from '../skeleton_loader/circle_loader/circle_loader';
import TitleLoader from '../skeleton_loader/title_loader/title_loader';
import LineChartLoader from '../skeleton_loader/line_chart_loader/line_chart_loader';
import widgetHoc, {WidgetHocProps} from '../widget_hoc/widget_hoc';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getMyTopChannels, getTopChannelsForTeam} from 'mattermost-redux/actions/insights';
import {TopChannel} from '@mattermost/types/insights';
import WidgetEmptyState from '../widget_empty_state/widget_empty_state';

import './../../activity_and_insights.scss';
import LineChart from 'components/analytics/line_chart';
import { FormattedMessage } from 'react-intl';
import { getTheme } from 'mattermost-redux/selectors/entities/preferences';

const TopChannels = (props: WidgetHocProps) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [topChannels, setTopChannels] = useState([] as TopChannel[]);
    const [channelLineChartData, setChannelLineChartData] = useState([
        {
            day: "2022-05-01",
            channels: [
                {
                    channel_id: "4r98uzxe4b8t5g9ntt9zcdzktw",
                    post_count: 93,
                },
                {
                    channel_id: "mn6xbu3bxfrs8d6kwbciza7erw",
                    post_count: 114,
                },
                {
                    channel_id: "hu3n1di5e3rtzkcchpzcx4yuic",
                    post_count: 324,
                },
                {
                    channel_id: "xxr6kgw3rtr39kwy5bujpfpcae",
                    post_count: 342,
                },
                {
                    channel_id: "45rsohaxtjg8tqogbb8mshp88a",
                    post_count: 169,
                },
            ]
        },
        {
            day: "2022-05-02",
            channels: [
                {
                    channel_id: "4r98uzxe4b8t5g9ntt9zcdzktw",
                    post_count: 203,
                },
                {
                    channel_id: "mn6xbu3bxfrs8d6kwbciza7erw",
                    post_count: 14,
                },
                {
                    channel_id: "hu3n1di5e3rtzkcchpzcx4yuic",
                    post_count: 304,
                },
                {
                    channel_id: "xxr6kgw3rtr39kwy5bujpfpcae",
                    post_count: 302,
                },
                {
                    channel_id: "45rsohaxtjg8tqogbb8mshp88a",
                    post_count: 109,
                },
            ]
        },
        {
            day: "2022-05-03",
            channels: [
                {
                    channel_id: "4r98uzxe4b8t5g9ntt9zcdzktw",
                    post_count: 230,
                },
                {
                    channel_id: "mn6xbu3bxfrs8d6kwbciza7erw",
                    post_count: 140,
                },
                {
                    channel_id: "hu3n1di5e3rtzkcchpzcx4yuic",
                    post_count: 340,
                },
                {
                    channel_id: "xxr6kgw3rtr39kwy5bujpfpcae",
                    post_count: 320,
                },
                {
                    channel_id: "45rsohaxtjg8tqogbb8mshp88a",
                    post_count: 190,
                },
            ]
        },
        {
            day: "2022-05-04",
            channels: [
                {
                    channel_id: "4r98uzxe4b8t5g9ntt9zcdzktw",
                    post_count: 123,
                },
                {
                    channel_id: "mn6xbu3bxfrs8d6kwbciza7erw",
                    post_count: 114,
                },
                {
                    channel_id: "hu3n1di5e3rtzkcchpzcx4yuic",
                    post_count: 134,
                },
                {
                    channel_id: "xxr6kgw3rtr39kwy5bujpfpcae",
                    post_count: 132,
                },
                {
                    channel_id: "45rsohaxtjg8tqogbb8mshp88a",
                    post_count: 219,
                },
            ]
        },
    ]);

    const currentTeamId = useSelector(getCurrentTeamId);
    const theme = useSelector(getTheme);

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

    const sortGraphData = () => {
        const labels = [];
        const values = {} as any;
        for (let i = 0; i < channelLineChartData.length; i++) {
            const item = channelLineChartData[i];
            labels.push(item.day);
            for (let j = 0; j < item.channels.length; j++) {
                const channel = item.channels[j];
                if (values[channel.channel_id]) {
                    values[channel.channel_id].push(channel.post_count);
                } else {
                    values[channel.channel_id] = [channel.post_count];
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

        return {
            datasets: [
                {
                    fillColor: theme.buttonBg,
                    borderColor: theme.buttonBg,
                    pointBackgroundColor: theme.buttonBg,
                    pointBorderColor: theme.buttonBg,
                    backgroundColor: 'transparent',
                    pointRadius: 2,
                    hoverBackgroundColor: theme.buttonBg,
                    label: topChannels[0].display_name,
                    data: data.values[topChannels[0].id],
                },
                {
                    fillColor: theme.onlineIndicator,
                    borderColor: theme.onlineIndicator,
                    pointBackgroundColor: theme.onlineIndicator,
                    pointBorderColor: theme.onlineIndicator,
                    backgroundColor: 'transparent',
                    pointRadius: 2,
                    hoverBackgroundColor: theme.onlineIndicator,
                    label: topChannels[1].display_name,
                    data: data.values[topChannels[1].id],
                },
                {
                    fillColor: theme.awayIndicator,
                    borderColor: theme.awayIndicator,
                    pointBackgroundColor: theme.awayIndicator,
                    pointBorderColor: theme.awayIndicator,
                    backgroundColor: 'transparent',
                    pointRadius: 2,
                    hoverBackgroundColor: theme.awayIndicator,
                    label: topChannels[2].display_name,
                    data: data.values[topChannels[2].id],
                },
                {
                    fillColor: theme.dndIndicator,
                    borderColor: theme.dndIndicator,
                    pointBackgroundColor: theme.dndIndicator,
                    pointBorderColor: theme.dndIndicator,
                    backgroundColor: 'transparent',
                    pointRadius: 2,
                    hoverBackgroundColor: theme.dndIndicator,
                    label: topChannels[3].display_name,
                    data: data.values[topChannels[3].id],
                },
                {
                    fillColor: theme.newMessageSeparator,
                    borderColor: theme.newMessageSeparator,
                    pointBackgroundColor: theme.newMessageSeparator,
                    pointBorderColor: theme.newMessageSeparator,
                    backgroundColor: 'transparent',
                    pointRadius: 2,
                    hoverBackgroundColor: theme.newMessageSeparator,
                    label: topChannels[4].display_name,
                    data: data.values[topChannels[4].id],
                },
            ],
            labels: data.labels,
        };
    }

    return (
        <>
            <div className='top-channel-container'>
                <div className='top-channel-line-chart'>
                    {
                        loading &&
                        <LineChartLoader/>
                    }
                    {
                        !loading &&
                        <>
                            <LineChart
                                title={
                                    <FormattedMessage
                                        id='analytics.system.totalBotPosts'
                                        defaultMessage='Top Channels'
                                    />
                                }
                                id='totalPostsPerChannel'
                                width={740}
                                height={225}
                                options={{
                                    responsive: true,
                                    scales: {
                                        xAxes: [{
                                            gridLines: {
                                                drawOnChartArea: false,
                                            },
                                        }],
                                        yAxes: [{
                                            gridLines: {
                                                drawOnChartArea: true,
                                            },
                                        }],
                                    },
                                    tooltips: {
                                        callbacks: {
                                            label: function(tooltipItem, data) {
                                                const index = tooltipItem.datasetIndex;
                                                if (typeof index !== 'undefined' && data.datasets && data.datasets[index] && data.datasets[index].label) {
                                                    console.log(data.datasets[index].label);
                                                    return data.datasets[index].label || '';
                                                }
                                                return '';
                                            },
                                            title: function() {
                                                return '';
                                            },
                                            footer: function(tooltipItem) {
                                                return `${tooltipItem[0].value} messages`;
                                            }
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
                        (!loading && topChannels) &&
                        <div className='channel-list'>
                            {
                                topChannels.map((channel) => {
                                    const barSize = (channel.message_count / topChannels[0].message_count);

                                    let iconToDisplay = <i className='icon icon-globe'/>;

                                    if (channel.type === Constants.PRIVATE_CHANNEL) {
                                        iconToDisplay = <i className='icon icon-lock'/>;
                                    }
                                    return (
                                        <div
                                            className='channel-row'
                                            key={channel.id}
                                        >
                                            <div className='channel-display-name'>
                                                <span className='icon'>
                                                    {iconToDisplay}
                                                </span>
                                                <span className='display-name'>{channel.display_name}</span>
                                            </div>
                                            <div className='channel-message-count'>
                                                <span className='message-count'>{channel.message_count}</span>
                                                <span
                                                    className='horizontal-bar'
                                                    style={{
                                                        flex: `${barSize} 0`,
                                                    }}
                                                />
                                            </div>
                                        </div>
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
