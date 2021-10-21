// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {useSelector} from 'react-redux';

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

const Day = () => {
    const todayKey = dateToWorkDateString(new Date());
    const blocks = useSelector((state: TimeState) => state.time.workBlocksByDay[todayKey]) || [];

    return (
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
    );
};

export default Day;
