// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useCallback, useEffect, useState} from 'react';
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
import {TopChannel} from '@mattermost/types/insights';
import WidgetEmptyState from '../widget_empty_state/widget_empty_state';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import './../../activity_and_insights.scss';

const TopChannels = (props: WidgetHocProps) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [topChannels, setTopChannels] = useState([] as TopChannel[]);

    const currentTeamId = useSelector(getCurrentTeamId);
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
