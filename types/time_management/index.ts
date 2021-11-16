// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Dictionary} from 'mattermost-redux/types/utilities';

export type Tag = {
    title: string;
    color: string;
}

export type WorkItem = {
    id: string;
    title: string;
    time: number;
    complete: boolean;
    tags?: Tag[];
}

export type BaseBlock = {
    id: string;
    start: Date;
    min_time?: number;
    tags?: Tag[];
}

export type WorkBlock = BaseBlock & {
    tasks: WorkItem[];
    reoccurring_id?: string;
};

export type ReoccurringBlock = BaseBlock & {
    frequency: string;
};

export type TimeState = {
    workBlocksByDay: Dictionary<WorkBlock[]>;
    unscheduledWorkItems: WorkItem[];
    reoccurringBlocks: ReoccurringBlock[];
};
