// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Dictionary} from 'mattermost-redux/types/utilities';

export type WorkItem = {
    id: string;
    title: string;
    time: number;
    complete: boolean;
}

export type WorkBlock = {
    id: string;
    start: Date;
    tasks: WorkItem[];
};

export type TimeState = {
    time: {
        workBlocksByDay: Dictionary<WorkBlock[]>;
        unscheduledWorkItems: WorkItem[];
    };
};
