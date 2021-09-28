// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {useSelector} from 'react-redux';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';

import {dateToWorkDateString} from 'utils/time_management/utils';
import {TimeState} from 'types/time_management';

import Calendar from './calendar';

import './day.scss';

const Container = styled.div`
    flex: 2;
    margin: 0px 10px;
    padding: 24px;
    background-color: #FFFFFF;
    border-radius: 8px;
    align-self: flex-start;
`;

const Title = styled.div`
    font-family: Metropolis;
    font-size: 18px;
    line-height: 24px;
    font-weight: 600;
`;

const Body = styled.div`
`;

const min = new Date();
min.setHours(8, 0, 0, 0);

const max = new Date();
max.setHours(19, 0, 0, 0);

const Day = () => {
    const todayKey = dateToWorkDateString(new Date());
    const blocks = useSelector((state: TimeState) => state.time.workBlocksByDay[todayKey]) || [];

    return (
        <DndProvider backend={HTML5Backend}>
            <Container>
                <Title>
                    {'Your Day'}
                </Title>
                <Body>
                    <Calendar
                        date={new Date()}
                        blocks={blocks}
                    />
                </Body>
            </Container>
        </DndProvider>
    );
};

export default Day;
