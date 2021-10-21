// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {useSelector} from 'react-redux';

import {TimeState} from 'types/time_management';

import Task from './task';

const Container = styled.div`
    flex: 1;
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
    margin-bottom: 20px;
    font-weight: 600;
`;

const Body = styled.div`
`;

const Unscheduled = () => {
    const tasks = useSelector((state: TimeState) => state.time.unscheduledWorkItems) || [];

    return (
        <Container>
            <Title>
                {'Unscheduled'}
            </Title>
            <Body>
                {tasks.map((task) => {
                    return (
                        <Task
                            key={task.id}
                            renderContainer={true}
                            task={task}
                        />
                    );
                })}
            </Body>
        </Container>
    );
};

export default Unscheduled;
