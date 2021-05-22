// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Audit} from './audits';
import {Channel} from './channels';
import {Group} from './groups';
import {PostType} from './posts';
import {Session} from './sessions';
import {Team} from './teams';
import {$ID, Dictionary, IDMappedObjects, RelationOneToMany, RelationOneToOne} from './utilities';

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

export type UserProfile = {
    id: string;
    create_at: number;
    update_at: number;
    delete_at: number;
    username: string;
    password: string;
    auth_data: string;
    auth_service: string;
    email: string;
    email_verified: boolean;
    nickname: string;
    first_name: string;
    last_name: string;
    position: string;
    roles: string;
    allow_marketing: boolean;
    props: Dictionary<string>;
    notify_props: UserNotifyProps;
    last_password_update: number;
    last_picture_update: number;
    failed_attempts: number;
    locale: string;
    timezone?: UserTimezone;
    mfa_active: boolean;
    mfa_secret: string;
    last_activity_at: number;
    is_bot: boolean;
    bot_description: string;
    bot_last_icon_update: number;
    terms_of_service_id: string;
    terms_of_service_create_at: number;
    remote_id?: string;
};

export type UserProfileWithLastViewAt = UserProfile & {
    last_viewed_at: number;
};

export type UsersState = {
    currentUserId: string;
    isManualStatus: RelationOneToOne<UserProfile, boolean>;
    mySessions: Session[];
    myAudits: Audit[];
    profiles: IDMappedObjects<UserProfile>;
    profilesInTeam: RelationOneToMany<Team, UserProfile>;
    profilesNotInTeam: RelationOneToMany<Team, UserProfile>;
    profilesWithoutTeam: Set<string>;
    profilesInChannel: RelationOneToMany<Channel, UserProfile>;
    profilesNotInChannel: RelationOneToMany<Channel, UserProfile>;
    profilesInGroup: RelationOneToMany<Group, UserProfile>;
    statuses: RelationOneToOne<UserProfile, string>;
    stats: RelationOneToOne<UserProfile, UsersStats>;
    filteredStats?: UsersStats;
    myUserAccessTokens: Dictionary<UserAccessToken>;
};

export type UserTimezone = {
    useAutomaticTimezone: boolean | string;
    automaticTimezone: string;
    manualTimezone: string;
};

export type UserActivity = {
    [postType in PostType]: {
        [userId in $ID<UserProfile>]: | {
            ids: Array<$ID<UserProfile>>;
            usernames: Array<UserProfile['username']>;
        } | Array<$ID<UserProfile>>;
    };
};

export type UserStatus = {
    user_id: string;
    status: string;
    manual?: boolean;
    last_activity_at?: number;
    active_channel?: string;
};

export type UserCustomStatus = {
    emoji: string;
    text: string;
};

export type UserAccessToken = {
    id: string;
    token?: string;
    user_id: string;
    description: string;
    is_active: boolean;
};

export type UsersStats = {
    total_users_count: number;
};

export type GetFilteredUsersStatsOpts = {
    in_team?: string;
    in_channel?: string;
    include_deleted?: boolean;
    include_bots?: boolean;
    roles?: string[];
    channel_roles?: string[];
    team_roles?: string[];
};

export type AuthChangeResponse = {
    follow_link: string;
};
