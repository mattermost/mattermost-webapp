// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useState, useCallback} from 'react';
import {useDispatch} from 'react-redux';

import Badge from 'components/widgets/badges/badge';
import Avatar from 'components/widgets/users/avatar';
import Markdown from 'components/markdown';
import Attachment from 'components/threading/global_threads/thread_item/attachments';

import {imageURLForUser} from 'utils/utils';

import TitleLoader from '../skeleton_loader/title_loader/title_loader';
import CircleLoader from '../skeleton_loader/circle_loader/circle_loader';
import widgetHoc, {WidgetHocProps} from '../widget_hoc/widget_hoc';

import WidgetEmptyState from '../widget_empty_state/widget_empty_state';

import './../../activity_and_insights.scss';
import Avatars from 'components/widgets/users/avatars';

const TopBoards = (props: WidgetHocProps) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [topBoards, setTopBoards] = useState([]);

    // const currentTeamId = useSelector(getCurrentTeamId);

    // const getTopTeamThreads = useCallback(async () => {
    //     if (props.filterType === InsightsScopes.TEAM) {
    //         setLoading(true);
    //         const data: any = await dispatch(getTopThreadsForTeam(currentTeamId, 0, 3, props.timeFrame));
    //         if (data.data && data.data.items) {
    //             setTopThreads(data.data.items);
    //         }
    //         setLoading(false);
    //     }
    // }, [props.timeFrame, currentTeamId, props.filterType]);

    // useEffect(() => {
    //     getTopTeamThreads();
    // }, [getTopTeamThreads]);

    // const getMyTeamThreads = useCallback(async () => {
    //     if (props.filterType === InsightsScopes.MY) {
    //         setLoading(true);
    //         const data: any = await dispatch(getMyTopThreads(currentTeamId, 0, 3, props.timeFrame));
    //         if (data.data && data.data.items) {
    //             setTopThreads(data.data.items);
    //         }
    //         setLoading(false);
    //     }
    // }, [props.timeFrame, props.filterType]);

    // useEffect(() => {
    //     getMyTeamThreads();
    // }, [getMyTeamThreads]);

    // const imageProps = useMemo(() => ({
    //     onImageHeightChanged: () => {},
    //     onImageLoaded: () => {},
    // }), []);

    const skeletonLoader = useCallback(() => {
        const entries = [];
        for (let i = 0; i < 4; i++) {
            entries.push(
                <div
                    className='top-board-loading-container'
                    key={i}
                >
                    <CircleLoader
                        size={32}
                    />
                    <div className='loading-lines'>
                        <TitleLoader/>
                        <TitleLoader/>
                    </div>
                </div>,
            );
        }
        return entries;
    }, []);

    return (
        <div className='top-board-container'>
            {
                loading &&
                skeletonLoader()
            }
            {
                (topBoards && !loading) &&
                <div className='board-list'>
                    <div
                        className='board-item'
                        onClick={() => {
                            console.log('test');
                        }}
                    >
                        <div className='display-info'>
                            <span className='display-name'>{`Beta launch tasks`}</span>
                            <span className='update-counts'>{`22 updates`}</span>
                        </div>
                        <Avatars
                            userIds={['mcaixe1wd78gmfps8xak89w3wh', 'o9rm6hmny3gajexk7sanqhy9pa']}
                            size='xs'
                            disableProfileOverlay={true}
                        />
                    </div>
                    <div
                        className='board-item'
                        onClick={() => {
                            console.log('test');
                        }}
                    >
                        <div className='display-info'>
                            <span className='display-name'>{`Beta launch tasks`}</span>
                            <span className='update-counts'>{`22 updates`}</span>
                        </div>
                        <Avatars
                            userIds={['mcaixe1wd78gmfps8xak89w3wh', 'o9rm6hmny3gajexk7sanqhy9pa']}
                            size='xs'
                            disableProfileOverlay={true}
                        />
                    </div>
                    <div
                        className='board-item'
                        onClick={() => {
                            console.log('test');
                        }}
                    >
                        <div className='display-info'>
                            <span className='display-name'>{`Beta launch tasks`}</span>
                            <span className='update-counts'>{`22 updates`}</span>
                        </div>
                        <Avatars
                            userIds={['mcaixe1wd78gmfps8xak89w3wh', 'o9rm6hmny3gajexk7sanqhy9pa']}
                            size='xs'
                            disableProfileOverlay={true}
                        />
                    </div>
                    <div
                        className='board-item'
                        onClick={() => {
                            console.log('test');
                        }}
                    >
                        <div className='display-info'>
                            <span className='display-name'>{`Beta launch tasks`}</span>
                            <span className='update-counts'>{`22 updates`}</span>
                        </div>
                        <Avatars
                            userIds={['mcaixe1wd78gmfps8xak89w3wh', 'o9rm6hmny3gajexk7sanqhy9pa']}
                            size='xs'
                            disableProfileOverlay={true}
                        />
                    </div>
                </div>

            }
            {
                // (topBoards.length === 0 && !loading) &&
                // <WidgetEmptyState
                //     icon={'product-boards'}
                // />
            }
        </div>
    );
};

export default memo(widgetHoc(TopBoards));
