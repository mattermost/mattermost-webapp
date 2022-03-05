// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

const EditButton = styled.button`
    border: 0;
    margin: 0px;
    padding: 0px;
    border-radius: 4px;
    background: rgba(var(--center-channel-text-rgb), 0.04);
    color: rgba(var(--center-channel-text-rgb), 0.56);
    &:hover {
        background: rgba(var(--center-channel-text-rgb), 0.08);
        color: rgba(var(--center-channel-text-rgb), 0.72);
    }
    width: 24px;
    height: 24px;
    i.icon {
        font-size: 14.4px;
    }
`;

interface EditableAreaProps {
    editable: boolean;
    content: JSX.Element;
    onEdit: () => void;
    className?: string;
}

const editableArea = ({editable, content, onEdit, className}: EditableAreaProps) => {
    return (
        <div className={className}>
            <div className='EditableArea__content'>{content}</div>
            <div className='EditableArea__edit'>
                {editable ? (<EditButton onClick={onEdit}><i className='icon icon-pencil-outline'/></EditButton>) : ''}
            </div>
        </div>
    );
};

const EditableArea = styled(editableArea)`
    display: flex;
    &>.EditableArea__content {
        flex: 1;
    }
    &:hover {
        &>.EditableArea__edit {
            visibility: visible;
        }
    }

    &>.EditableArea__edit {
        visibility: hidden;
        width: 24px;
    }
`;

export default EditableArea;
