// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useEffect, useState, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getTopReactionsForTeam} from 'mattermost-redux/actions/teams';
import {getCurrentTeamId, getTopReactionsForCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {GlobalState} from 'mattermost-redux/types/store';

import RenderEmoji from 'components/emoji/render_emoji';
import BarChartLoader from '../skeleton_loader/bar_chart_loader/bar_chart_loader';
import CircleLoader from '../skeleton_loader/circle_loader/circle_loader';
import widgetHoc, {WidgetHocProps} from '../widget_hoc/widget_hoc';

import './../../activity_and_insights.scss';

const TopReactions = (props: WidgetHocProps) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);

    const topTeamReactions = useSelector((state: GlobalState) => getTopReactionsForCurrentTeam(state, props.timeFrame));
    const currentTeamId = useSelector(getCurrentTeamId);

    const getTopTeamReactions = useCallback(async () => {
        setLoading(true);
        await dispatch(getTopReactionsForTeam(currentTeamId, 0, 10, props.timeFrame));
        setLoading(false);
    }, [props.timeFrame, currentTeamId])

    useEffect(() => {
        getTopTeamReactions();
    }, [getTopTeamReactions]);

    return (
        <div className='top-reaction-container'>
            {loading && 
                <>
                    <div className='bar-chart-entry'>
                        <BarChartLoader/>
                        <CircleLoader
                            size={20}
                        />
                    </div>
                    <div className='bar-chart-entry'>
                        <BarChartLoader/>
                        <CircleLoader
                            size={20}
                        />
                    </div>
                    <div className='bar-chart-entry'>
                        <BarChartLoader/>
                        <CircleLoader
                            size={20}
                        />
                    </div>
                    <div className='bar-chart-entry'>
                        <BarChartLoader/>
                        <CircleLoader
                            size={20}
                        />
                    </div>
                    <div className='bar-chart-entry'>
                        <BarChartLoader/>
                        <CircleLoader
                            size={20}
                        />
                    </div>
                </>
            }
            {
                topTeamReactions &&
                topTeamReactions.map((reaction) => {
                    const highestCount = topTeamReactions[0].count;
                    const maxHeight = 156;

                    let barHeight = reaction.count/highestCount * maxHeight;

                    if (highestCount === reaction.count) {
                        barHeight = maxHeight;
                    }

                    return (
                        <div className='bar-chart-entry'>
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
            
        </div>
    );
};

export default memo(widgetHoc(TopReactions));
