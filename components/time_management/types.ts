// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export interface Checklist {
    title: string;
    items: ChecklistItem[];
}

export enum ChecklistItemState {
    Open = '',
    InProgress = 'in_progress',
    Closed = 'closed',
}

export interface ChecklistItem {
    title: string;
    description: string;
    state: ChecklistItemState;
    state_modified?: number;
    state_modified_post_id?: string;
    assignee_id?: string;
    assignee_modified?: number;
    assignee_modified_post_id?: string;
}

export function emptyChecklist(): Checklist {
    return {
        title: 'Default checklist',
        items: [emptyChecklistItem()],
    };
}

export function emptyChecklistItem(): ChecklistItem {
    return {
        title: '',
        state: ChecklistItemState.Open,
        description: '',
    };
}

export const newChecklistItem = (title = '', description = '', state = ChecklistItemState.Open): ChecklistItem => ({
    title,
    description,
    state,
});

export interface ChecklistItemsFilter extends Record<string, boolean> {
    all: boolean;
    checked: boolean;
    me: boolean;
    unassigned: boolean;
    others: boolean;
}

export const ChecklistItemsFilterDefault: ChecklistItemsFilter = {
    all: false,
    checked: false,
    me: true,
    unassigned: true,
    others: true,
};

// eslint-disable-next-line
export function isChecklist(arg: any): arg is Checklist {
    return arg &&
        typeof arg.title === 'string' &&
        arg.items && Array.isArray(arg.items) && arg.items.every(isChecklistItem);
}

// eslint-disable-next-line
export function isChecklistItem(arg: any): arg is ChecklistItem {
    return arg &&
        typeof arg.title === 'string' &&
        typeof arg.state_modified === 'number' &&
        typeof arg.state_modified_post_id === 'string' &&
        typeof arg.assignee_id === 'string' &&
        typeof arg.assignee_modified === 'number' &&
        typeof arg.assignee_modified_post_id === 'string' &&
        typeof arg.state === 'string' &&
        typeof arg.command === 'string' &&
        typeof arg.command_last_run === 'number';
}
