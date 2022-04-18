// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useEffect, useState, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import Icon from '@mattermost/compass-components/foundations/icon/Icon';

import {getTopReactionsForTeam} from 'mattermost-redux/actions/teams';
import {getMyTopReactions} from 'mattermost-redux/actions/users';
import {getCurrentTeamId, getTopReactionsForCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getMyTopReactionsByTime} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from 'mattermost-redux/types/store';

import {InsightsScopes} from 'utils/constants';

import RenderEmoji from 'components/emoji/render_emoji';
import BarChartLoader from '../skeleton_loader/bar_chart_loader/bar_chart_loader';
import CircleLoader from '../skeleton_loader/circle_loader/circle_loader';
import widgetHoc, {WidgetHocProps} from '../widget_hoc/widget_hoc';

import './../../activity_and_insights.scss';

const TopReactions = (props: WidgetHocProps) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);

    const topReactions = props.filterType === InsightsScopes.TEAM ? useSelector((state: GlobalState) => getTopReactionsForCurrentTeam(state, props.timeFrame)) : useSelector((state: GlobalState) => getMyTopReactionsByTime(state, props.timeFrame));
    const currentTeamId = useSelector(getCurrentTeamId);

    const getTopTeamReactions = useCallback(async () => {
        if (props.filterType === InsightsScopes.TEAM) {
            setLoading(true);
            await dispatch(getTopReactionsForTeam(currentTeamId, 0, 10, props.timeFrame));
            setLoading(false);
        }
    }, [props.timeFrame, currentTeamId, props.filterType])

    useEffect(() => {
        getTopTeamReactions();
    }, [getTopTeamReactions]);

    const getMyTeamReactions = useCallback(async () => {
        if (props.filterType === InsightsScopes.MY) {
            setLoading(true);
            await dispatch(getMyTopReactions(0, 10, props.timeFrame));
            setLoading(false);
        }
    }, [props.timeFrame, props.filterType])

    useEffect(() => {
        getMyTeamReactions();
    }, [getMyTeamReactions]);

    const skeletonLoader = useCallback(() => {
        const entries = [];
        for (let i = 0; i < 5; i++) {
            entries.push(
                <div className='bar-chart-entry'>
                    <BarChartLoader/>
                    <CircleLoader
                        size={20}
                    />
                </div>,
            );
        }
        return entries;
    }, []);

    return (
        <div className='top-reaction-container'>
            {
                loading && 
                skeletonLoader()
            }
            {
                (topReactions && !loading) &&
                topReactions.map((reaction) => {
                    const highestCount = topReactions[0].count;
                    const maxHeight = 156;

                    let barHeight = reaction.count/highestCount * maxHeight;

                    if (highestCount === reaction.count) {
                        barHeight = maxHeight;
                    }

                    return (
                        <div 
                            className='bar-chart-entry'
                            key={reaction.emoji_name}
                        >
                            <span className='reaction-count'>{reaction.count}</span>
                            <div 
                                className='bar-chart-data'
                                style={{
                                    height: `${barHeight}px`,
                                }}
                            />
                            <RenderEmoji
                                emojiName={reaction.emoji_name}
                                size={20}
                            />
                        </div>
                    );
                })
                
            }
            {
                (topReactions.length === 0 && !loading) &&
                <div className='empty-state'>
                    <div className='empty-state-emoticon'>
                        <Icon
                            glyph={'emoticon-outline'}
                        />
                    </div>
                    <div className='empty-state-text'>
                        <FormattedMessage
                            id='insights.topReactions.empty'
                            defaultMessage='Not enough data yet for this insight'
                        />
                    </div>
                </div>
            }
            
        </div>
    );
};

export default memo(widgetHoc(TopReactions));
