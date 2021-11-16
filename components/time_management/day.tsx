// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import styled from 'styled-components';
import moment from 'moment';
import {useSelector} from 'react-redux';
import {useIntl} from 'react-intl';
import {Button} from 'react-bootstrap';

import {dateToWorkDateString} from 'utils/time_management/utils';
import {WorkBlock} from 'types/time_management';

import {GlobalState} from 'mattermost-redux/types/store';

import {generateId} from 'mattermost-redux/utils/helpers';

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

const StartHour = 9;
const EndHour = 19;

const Day = () => {
    const {formatDate} = useIntl();

    const defaultDate = new Date();
    const [date, setDate] = useState(defaultDate);

    const defaultDayStart = new Date(defaultDate);
    defaultDayStart.setHours(StartHour, 0, 0, 0);
    const [dayStart, setDayStart] = useState(defaultDayStart);

    const defaultDayEnd = new Date(defaultDate);
    defaultDayEnd.setHours(EndHour, 0, 0, 0);
    const [dayEnd, setDayEnd] = useState(defaultDayEnd);

    const blocks: WorkBlock[] = useSelector((state: GlobalState) => {
        const key = dateToWorkDateString(date);
        const adhocBlocks = state.time.workBlocksByDay[key] || [];
        const reoccurringBlocks = state.time.reoccurringBlocks || [];
        const reoccurringBlocksForDate = reoccurringBlocks.filter((b) => b.frequency === 'daily');

        const fakeBlocks: WorkBlock[] = [];
        reoccurringBlocksForDate.forEach((r) => {
            const found = adhocBlocks.find((b) => b.reoccurring_id === r.id);

            // If the reoccurring block doesn't have a corresponding real block, create a fake one
            // TODO support frequencies other than daily
            if (!found) {
                const start = new Date(date);
                start.setHours(r.start.getHours(), r.start.getMinutes(), 0, 0);
                fakeBlocks.push({
                    id: `reoccurring_${generateId()}`,
                    tasks: [],
                    start,
                    min_time: r.min_time,
                    tags: r.tags,
                    reoccurring_id: r.id,
                });
            }
        });

        return [...adhocBlocks, ...fakeBlocks];
    }) || [];

    const setDayStartAndEnd = (date: Date) => {
        const newDayStart = new Date(date);
        newDayStart.setHours(StartHour, 0, 0, 0);
        setDayStart(newDayStart);
        const newDayEnd = new Date(date);
        newDayEnd.setHours(EndHour, 0, 0, 0);
        setDayEnd(newDayEnd);
    };

    const nextDay = () => {
        const newDate = moment(date).add(1, 'day').toDate();
        setDate(newDate);
        setDayStartAndEnd(newDate);
    };

    const previousDay = () => {
        const newDate = moment(date).subtract(1, 'day').toDate();
        setDate(newDate);
        setDayStartAndEnd(newDate);
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
                    date={date}
                    dayStart={dayStart}
                    dayEnd={dayEnd}
                    blocks={blocks}
                />
            </Body>
        </Container>
    );
};

export default Day;
