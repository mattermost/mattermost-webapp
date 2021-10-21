// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef} from 'react';
import styled from 'styled-components';
import {useDrag} from 'react-dnd';

import {DragTypes} from 'utils/time_management/constants';
import {WorkItem} from 'types/time_management';

import ChecklistItemComponent from './checklist_item';
import {ChecklistItemState, newChecklistItem} from './types';

const Body = styled.div`
    margin: 15px;
    display: flex;
    flex-direction: row;
`;

const TimeBox = styled.div`
    background: #E1D2FB;
    border-radius: 4px;
    margin: 5px 0px;
    padding: 0px 5px;

    font-family: Open Sans;
    font-style: normal;
    font-size: 14px;
    line-height: 20px;
`;

const Container = styled.div`
    background: linear-gradient(0deg, rgba(63, 67, 80, 0.04), rgba(63, 67, 80, 0.04)), #FFFFFF;
    border: 1px solid rgba(61, 60, 64, 0.16) !important;
    box-sizing: border-box;
    box-shadow: 0px 6px 14px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
`;

type Props = {
    task: WorkItem;
    parentId?: string;
    renderContainer?: boolean;
    updateTaskCompletion?: (taskId: string, state: ChecklistItemState) => void;
}

const Task = (props: Props) => {
    const {task, renderContainer, updateTaskCompletion, parentId} = props;

    const onChange = (item: ChecklistItemState) => {
        if (updateTaskCompletion) {
            updateTaskCompletion(task.id, item);
        }
    };

    const ref = useRef(null);

    const [{isDragging}, drag] = useDrag({
        type: DragTypes.TASK,
        item: () => {
            return {task, sourceId: parentId};
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const opacity = isDragging ? 0 : 1;

    const bodyRef = renderContainer ? null : ref;

    const body = (
        <Body
            ref={bodyRef}
            style={{
                opacity,
            }}
        >
            <ChecklistItemComponent
                checklistItem={newChecklistItem(task.title, undefined, task.complete ? ChecklistItemState.Closed : ChecklistItemState.Open)}
                disabled={updateTaskCompletion == null}
                onChange={onChange}
            />
            <TimeBox>{`${task.time} mins`}</TimeBox>
        </Body>
    );

    if (renderContainer) {
        drag(ref);
        return (
            <Container
                ref={ref}
                style={{
                    opacity,
                }}
            >
                {body}
            </Container>
        );
    }

    drag(bodyRef);
    return body;
};

export default Task;
