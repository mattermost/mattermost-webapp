// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import styled from 'styled-components';
import moment from 'moment';
import {useSelector} from 'react-redux';
import {useIntl} from 'react-intl';
import {Button} from 'react-bootstrap';

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
    display: flex;
`;

const TitleText = styled.div`
    font-family: Metropolis;
    font-size: 18px;
    line-height: 34px;
    font-weight: 600;

    min-width: 235px;
    padding-left: 5px;

    flex: 0;
`;

const Body = styled.div`
`;

const ChangeDayButton = styled(Button)`
    flex: 0;
    margin: 0px 5px;
`;

const Day = () => {
    const [date, setDate] = useState(new Date());
    const todayKey = dateToWorkDateString(date);
    const blocks = useSelector((state: TimeState) => state.time.workBlocksByDay[todayKey]) || [];

    const {formatDate} = useIntl();

    const nextDay = () => {
        setDate(moment(date).add(1, 'day').toDate());
    };

    const previousDay = () => {
        setDate(moment(date).subtract(1, 'day').toDate());
    };

    return (
        <Container>
            <Title>
                <ChangeDayButton
                    onClick={previousDay}
                    size={1}
                >
                    {'<'}
                </ChangeDayButton>
                <TitleText>
                    {formatDate(date, {month: 'long', weekday: 'long', day: 'numeric'})}
                </TitleText>
                <ChangeDayButton
                    onClick={nextDay}
                    size={1}
                >
                    {'>'}
                </ChangeDayButton>
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
