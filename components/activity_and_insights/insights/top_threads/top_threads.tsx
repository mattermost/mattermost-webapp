// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useEffect, useState, useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getMyTopThreads, getTopThreadsForTeam} from 'mattermost-redux/actions/insights';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import {Post} from '@mattermost/types/posts';
import {TopThread} from '@mattermost/types/insights';
import {UserProfile} from '@mattermost/types/users';

import {selectPost} from 'actions/views/rhs';

import Badge from 'components/widgets/badges/badge';
import Avatar from 'components/widgets/users/avatar';
import Markdown from 'components/markdown';
import Attachment from 'components/threading/global_threads/thread_item/attachments';

import {InsightsScopes} from 'utils/constants';
import {imageURLForUser} from 'utils/utils';

import TitleLoader from '../skeleton_loader/title_loader/title_loader';
import CircleLoader from '../skeleton_loader/circle_loader/circle_loader';
import widgetHoc, {WidgetHocProps} from '../widget_hoc/widget_hoc';
import WidgetEmptyState from '../widget_empty_state/widget_empty_state';

import './../../activity_and_insights.scss';
import './top_threads.scss';

const TopThreads = (props: WidgetHocProps) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [topThreads, setTopThreads] = useState([] as TopThread[]);

    const currentTeamId = useSelector(getCurrentTeamId);
    const teammateNameDisplaySetting = useSelector(getTeammateNameDisplaySetting);

    const getTopTeamThreads = useCallback(async () => {
        if (props.filterType === InsightsScopes.TEAM) {
            setLoading(true);
            const data: any = await dispatch(getTopThreadsForTeam(currentTeamId, 0, 3, props.timeFrame));
            if (data.data?.items) {
                setTopThreads(data.data.items);
            }
            setLoading(false);
        }
    }, [props.timeFrame, currentTeamId, props.filterType]);

    useEffect(() => {
        getTopTeamThreads();
    }, [getTopTeamThreads]);

    const getMyTeamThreads = useCallback(async () => {
        if (props.filterType === InsightsScopes.MY) {
            setLoading(true);
            const data: any = await dispatch(getMyTopThreads(currentTeamId, 0, 3, props.timeFrame));
            if (data.data?.items) {
                setTopThreads(data.data.items);
            }
            setLoading(false);
        }
    }, [props.timeFrame, props.filterType]);

    useEffect(() => {
        getMyTeamThreads();
    }, [getMyTeamThreads]);

    const skeletonLoader = useMemo(() => {
        const entries = [];
        for (let i = 0; i < 3; i++) {
            entries.push(
                <div
                    className='top-thread-loading-container'
                    key={i}
                >
                    <div className='top-thread-loading-row'>
                        <CircleLoader
                            size={20}
                        />
                        <TitleLoader/>
                    </div>
                    <div className='loading-lines'>
                        <TitleLoader/>
                        <TitleLoader/>
                    </div>
                </div>,
            );
        }
        return entries;
    }, []);

    const openRHS = async (post: Post) => {
        dispatch(selectPost(post));
    };

    return (
        <div className='top-thread-container'>
            {
                loading &&
                skeletonLoader
            }
            {
                (topThreads && !loading) &&
                <div className='thread-list'>
                    {
                        topThreads.map((thread, key) => {
                            return (
                                <div
                                    className='thread-item'
                                    onClick={() => {
                                        openRHS(thread.post);
                                    }}
                                    key={key}
                                >
                                    <div className='thread-details'>
                                        <Avatar
                                            url={imageURLForUser(thread.user_information.id)}
                                            size={'xs'}
                                        />
                                        <span className='display-name'>{displayUsername(thread.user_information as UserProfile, teammateNameDisplaySetting)}</span>
                                        <Badge>
                                            {thread.channel_display_name}
                                        </Badge>
                                        <div className='reply-count'>
                                            <i className='icon icon-reply-outline'/>
                                            <span>{thread.post.reply_count}</span>
                                        </div>
                                    </div>
                                    <div
                                        aria-readonly='true'
                                        className='preview'
                                    >
                                        {thread.post.message ? (
                                            <Markdown
                                                message={thread.post.message}
                                                options={{
                                                    singleline: true,
                                                    mentionHighlight: false,
                                                    atMentions: false,
                                                }}
                                                imagesMetadata={thread.post?.metadata && thread.post?.metadata?.images}
                                            />
                                        ) : (
                                            <Attachment post={thread.post}/>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>

            }
            {
                (topThreads.length === 0 && !loading) &&
                <WidgetEmptyState
                    icon={'message-text-outline'}
                />
            }
        </div>
    );
};

export default memo(widgetHoc(TopThreads));
