// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export interface App {
    name: string;
    icon: string;
    notifications_categories: NotificationCategory[];
}

export interface NotificationCategory {
    name: string;
    icon?: string;
    hoverText: string;
    notifications: Notification[];
}

export interface Notification {
    message: string;
    link: string;
}
