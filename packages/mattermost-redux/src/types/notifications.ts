// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export interface App {
    name: string;
    icon: string;
    types: NotificationType[];
}

export interface NotificationType {
    name: string;
    icon: string;
    description: string;
}

export interface Notification {
    id: string;
    title: string;
    body: string;
    url: string;
    type: string;
    provider: string;
    source_id: string;
    user_id: string;
    metadata: {};
}

export interface NotificationCount {
    provider: string;
    type: string;
    value: number;
}
