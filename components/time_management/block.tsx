// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef} from 'react';
import styled from 'styled-components';
import moment from 'moment';
import {useDrag, useDrop} from 'react-dnd';

import {findIndex} from 'lodash';

import {PixelPerMinute, DragTypes} from 'utils/time_management/constants';
import {calculateMinutesInBlock} from 'utils/time_management/utils';
import {WorkBlock, WorkItem} from 'types/time_management';

import Task from './task';
import {ChecklistItemState} from './types';

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

const Header = styled.div`
    min-height: 10px;
    max-height: 10px;
    background-color: rgba(63, 67, 80, 0.04);
    flex: 1;
`;

type Props = {
    block: WorkBlock;
    dayStart: Date;
    updateBlock: (block: WorkBlock, extra?: {addedTaskId: string | undefined; sourceId: string | undefined}) => void;
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

    const [{handlerId}, drop] = useDrop({
        accept: DragTypes.TASK,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        drop(item: any, monitor) {
            if (!ref.current) {
                return;
            }

            addTaskToBlock(item.task, item.sourceId);
        },
    });

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

    const addTaskToBlock = (task: WorkItem, sourceId: string | undefined) => {
        if (block.tasks.findIndex((t) => t.id === task.id) !== -1) {
            return;
        }
        const newBlock = {...block};
        newBlock.tasks = [...block.tasks, task];
        updateBlock(newBlock, {addedTaskId: task.id, sourceId});
    };

    drop(drag(ref));
    return (
        <Container
            ref={ref}
            data-handler-id={handlerId}
            key={`block_${block.start.toDateString()}`}
            style={{
                top: `${PixelPerMinute * minutesFromDayStart}px`,
                height: `${(PixelPerMinute * totalMinutes) - 4}px`,
                opacity,
            }}
        >
            <Header/>
            {block.tasks.map((task) => (
                <Task
                    key={task.id}
                    task={task}
                    updateTaskCompletion={updateTaskCompletion}
                    parentId={block.id}
                />),
            )}
        </Container>
    );
};

export default Block;
