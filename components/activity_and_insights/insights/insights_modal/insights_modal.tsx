// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useState, useCallback} from 'react';

import {Modal} from 'react-bootstrap';

import {InsightsWidgetTypes, TimeFrame} from '@mattermost/types/insights';

import TimeFrameDropdown from '../time_frame_dropdown/time_frame_dropdown';
import TopReactionsTable from '../top_reactions/top_reactions_table/top_reactions_table';
import TopChannelsTable from '../top_channels/top_channels_table/top_channels_table';
import TopThreadsTable from '../top_threads/top_threads_table/top_threads_table';
import TopBoardsTable from '../top_boards/top_boards_table/top_boards_table';

import './../../activity_and_insights.scss';
import './insights_modal.scss';

type Props = {
    onExited: () => void;
    widgetType: InsightsWidgetTypes;
    title: string;
    subtitle: string;
    filterType: string;
    timeFrame: TimeFrame;
    timeFrameLabel: string;
}

const InsightsModal = (props: Props) => {
    const [show, setShow] = useState(true);
    const [timeFrame, setTimeFrame] = useState({
        value: props.timeFrame,
        label: props.timeFrameLabel,
    });

    const setTimeFrameValue = useCallback((value) => {
        setTimeFrame(value);
    }, []);

    const doHide = useCallback(() => {
        setShow(false);
    }, []);

    const modalContent = useCallback(() => {
        switch (props.widgetType) {
        case InsightsWidgetTypes.TOP_CHANNELS:
            return (
                <TopChannelsTable
                    filterType={props.filterType}
                    timeFrame={timeFrame.value}
                    closeModal={doHide}
                />
            );
        case InsightsWidgetTypes.TOP_REACTIONS:
            return (
                <TopReactionsTable
                    filterType={props.filterType}
                    timeFrame={timeFrame.value}
                />
            );
        case InsightsWidgetTypes.TOP_THREADS:
            return (
                <TopThreadsTable
                    filterType={props.filterType}
                    timeFrame={timeFrame.value}
                    closeModal={doHide}
                />
            );
        case InsightsWidgetTypes.TOP_BOARDS:
            return (
                <TopBoardsTable
                    filterType={props.filterType}
                    timeFrame={timeFrame.value}
                    closeModal={doHide}
                />
            );
        default:
            return null;
        }
    }, [props.widgetType, timeFrame]);

    return (
        <Modal
            dialogClassName='a11y__modal insights-modal'
            show={show}
            onHide={doHide}
            onExited={props.onExited}
            aria-labelledby='insightsModalLabel'
            id='insightsModal'
        >
            <Modal.Header closeButton={true}>
                <div className='title-section'>
                    <Modal.Title
                        componentClass='h1'
                        id='insightsModalTitle'
                    >
                        {props.title}
                    </Modal.Title>
                    <div className='subtitle'>
                        {props.subtitle}
                    </div>
                </div>
                <TimeFrameDropdown
                    timeFrame={timeFrame}
                    setTimeFrame={setTimeFrameValue}
                />
            </Modal.Header>
            <Modal.Body
                className='overflow--visible'
            >
                {modalContent()}
            </Modal.Body>
        </Modal>
    );
};

export default memo(InsightsModal);
