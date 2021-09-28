// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef} from 'react';
import styled from 'styled-components';
import moment from 'moment';
import {useDrag} from 'react-dnd';

import {PixelPerMinute, DragTypes} from 'utils/time_management/constants';
import {calculateMinutesInBlock} from 'utils/time_management/utils';
import {WorkBlock} from 'types/time_management';

import ChecklistItemComponent from './checklist_item';
import {ChecklistItemState, newChecklistItem} from './types';

const Container = styled.div`
    background: linear-gradient(0deg, rgba(63, 67, 80, 0.04), rgba(63, 67, 80, 0.04)), #FFFFFF;
    border: 1px solid rgba(61, 60, 64, 0.16) !important;
    box-sizing: border-box;
    box-shadow: 0px 6px 14px rgba(0, 0, 0, 0.12);
    border-radius: 4px;

    font-family: Open Sans;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: #3D3C40;

    margin-left: 10px;
    margin-top: 2px;
    position: absolute;
    width: 95%;

    display: flex;
    flex-direction: column;

    left: 65px;
`;

const Task = styled.div`
    margin: 15px;
`;

type Props = {
    block: WorkBlock;
    dayStart: Date;
    updateBlock: (block: WorkBlock) => void;
}

const Block = (props: Props) => {
    const {block, dayStart, updateBlock} = props;
    const ref = useRef(null);

    const [{isDragging}, drag] = useDrag({
        type: DragTypes.BLOCK,
        item: () => {
            return {block};
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const opacity = isDragging ? 0 : 1;

    const totalMinutes = calculateMinutesInBlock(block);
    const minutesFromDayStart = moment(block.start).diff(dayStart, 'minutes');

    const updateTaskCompletion = (taskId: string, state: ChecklistItemState) => {
        const index = block.tasks.findIndex((task) => task.id === taskId);
        if (index < 0) {
            return;
        }
        const newTask = {...block.tasks[index]};
        newTask.complete = state === ChecklistItemState.Closed;
        const newBlock = {...block};
        const newTasks = [...newBlock.tasks];
        newTasks.splice(index, 1, newTask);
        newBlock.tasks = newTasks;
        updateBlock(newBlock);
    };

    drag(ref);
    return (
        <Container
            ref={ref}
            key={`block_${block.start.toDateString()}`}
            style={{
                top: `${PixelPerMinute * minutesFromDayStart}px`,
                height: `${(PixelPerMinute * totalMinutes) - 4}px`,
                opacity,
            }}
        >
            {block.tasks.map((task) => {
                return (
                    <Task key={task.title}>
                        <ChecklistItemComponent
                            checklistItem={newChecklistItem(task.title, undefined, task.complete ? ChecklistItemState.Closed : ChecklistItemState.Open)}
                            disabled={false}
                            onChange={(item) => updateTaskCompletion(task.id, item)}
                        />
                    </Task>
                );
            })}
        </Container>
    );
};

export default Block;
