// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type JobType = 'data_retention' | 'elasticsearch_post_indexing' | 'ldap_sync' | 'message_export';

export type JobStatus = 'pending' | 'in_progress' | 'success' | 'error' | 'cancel_requested' | 'canceled';

export type Job = JobTypeBase & {
    id: string;
    type: JobType;
    priority: number;
    create_at: number;
    start_at: number;
    last_activity_at: number;
    status: JobStatus;
    progress: number;
    data: any;
};

export type JobTypeBase = {
    type: JobType;
}
