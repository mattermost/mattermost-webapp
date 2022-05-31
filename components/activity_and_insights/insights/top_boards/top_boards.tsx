// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useState, useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {FormattedMessage} from 'react-intl';

import Avatars from 'components/widgets/users/avatars';

import TitleLoader from '../skeleton_loader/title_loader/title_loader';
import CircleLoader from '../skeleton_loader/circle_loader/circle_loader';
import widgetHoc, {WidgetHocProps} from '../widget_hoc/widget_hoc';

import './../../activity_and_insights.scss';

const TopBoards = (props: WidgetHocProps) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [topBoards, setTopBoards] = useState([
        {
            boardID: 'bywgrht51s3y4unm6478becycxa',
            icon: '⛄',
            title: 'Project Tasks',
            activityCount: 51,
            activeUsers: 'jddqfjxezifxbnwdw75xsdsqcy',
            createdBy: 'excsimz1j387ibfz7bofc4zaie',
        },
        {
            boardID: 'biiow3dns57dr5k5qmse58b3j1r',
            icon: '📅',
            title: 'Content Calendar',
            activityCount: 21,
            activeUsers: 'jddqfjxezifxbnwdw75xsdsqcy',
            createdBy: 'excsimz1j387ibfz7bofc4zaie',
        },
        {
            boardID: 'bywgrht51s3y4unm6478becycxa',
            icon: '⛄',
            title: 'Project Tasks',
            activityCount: 51,
            activeUsers: 'jddqfjxezifxbnwdw75xsdsqcy',
            createdBy: 'excsimz1j387ibfz7bofc4zaie',
        },
        {
            boardID: 'biiow3dns57dr5k5qmse58b3j1r',
            icon: '📅',
            title: 'Content Calendar',
            activityCount: 21,
            activeUsers: 'jddqfjxezifxbnwdw75xsdsqcy',
            createdBy: 'excsimz1j387ibfz7bofc4zaie',
        },
    ]);

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
                    {
                        topBoards.map((board, i) => {
                            return (
                                <div
                                    className='board-item'
                                    onClick={() => {
                                        console.log('test');
                                    }}
                                >
                                    <span className='board-icon'>{board.icon}</span>
                                    <div className='display-info'>
                                        <span className='display-name'>{board.title}</span>
                                        <span className='update-counts'>
                                            <FormattedMessage
                                                id='insights.topBoards.updates'
                                                defaultMessage='{updateCount} updates'
                                                values={{
                                                    updateCount: board.activityCount,
                                                }}
                                            />
                                        </span>
                                    </div>
                                    <Avatars
                                        userIds={[board.activeUsers]}
                                        size='xs'
                                        disableProfileOverlay={true}
                                    />
                                </div>
                            );
                        })
                    }
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
