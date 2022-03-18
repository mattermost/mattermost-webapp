// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    nickname: string;
    isBot: boolean;
    isGuest: boolean;
    isSystemAdmin: boolean;
    createAt: number;
    deleteAt: number;
    authService: string;
    customStatus: CustomStatus;
    status: Status;
    props: Record<string, string>;
    notifyProps: UserNotifyProps;
    lastPictureUpdateAt: number;
    locale: string;
    timezone: UserTimezone;
    position: string;
    roles: Role[];
    preferences: Preference[];
    sessions: Session[];
}

interface CustomStatus {
    emoji: string;
    text: string;
    duration: string;
    expiresAt: string;
}

interface Status {
    status: string;
    manual: number;
    lastActivityAt: number;
    activeChannel: string;
    dndEndTime: number;
}

interface Role {
    id: string;
    name: string;
    permissions: string[];
    schemeManaged: boolean;
    builtIn: boolean;
}

export interface Preference {
    userId: string;
    category: string;
    name: string;
    value: string;
}

interface Session {
    d: string;
    token: string;
    createAt: number;
    expiresAt: number;
}

export type UserNotifyProps = {
    desktop: 'default' | 'all' | 'mention' | 'none';
    desktop_sound: 'true' | 'false';
    email: 'true' | 'false';
    mark_unread: 'all' | 'mention';
    push: 'default' | 'all' | 'mention' | 'none';
    push_status: 'ooo' | 'offline' | 'away' | 'dnd' | 'online';
    comments: 'never' | 'root' | 'any';
    first_name: 'true' | 'false';
    channel: 'true' | 'false';
    mention_keys: string;
};

export type UserTimezone = {
    useAutomaticTimezone: boolean | string;
    automaticTimezone: string;
    manualTimezone: string;
};
