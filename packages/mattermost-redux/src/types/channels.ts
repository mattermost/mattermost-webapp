// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {IDMappedObjects, UserIDMappedObjects, RelationOneToMany, RelationOneToOne} from './utilities';
import {Team} from './teams';

export type ChannelType = 'O' | 'P' | 'D' | 'G';

export type ChannelStats = {
    channel_id: string;
    member_count: number;
    guest_count: number;
    pinnedpost_count: number;
};

export type ChannelNotifyProps = {
    desktop: 'default' | 'all' | 'mention' | 'none';
    email: 'default' | 'all' | 'mention' | 'none';
    mark_unread: 'all' | 'mention';
    push: 'default' | 'all' | 'mention' | 'none';
    ignore_channel_mentions: 'default' | 'off' | 'on';
};

export type Channel = {
    id: string;
    create_at: number;
    update_at: number;
    delete_at: number;
    team_id: string;
    type: ChannelType;
    display_name: string;
    name: string;
    header: string;
    purpose: string;
    last_post_at: number;
    creator_id: string;
    scheme_id: string;
    teammate_id?: string;
    status?: string;
    group_constrained: boolean;
    shared?: boolean;
    props?: Record<string, any>;
    policy_id?: string | null;
};

export type ServerChannel = Channel & {

    /**
     * The total number of posts in this channel, not including join/leave messages
     *
     * @remarks This field will be moved to a {@link ChannelMessageCount} object when this channel is stored in Redux.
     */
    total_msg_count: number;

    /**
     * The number of root posts in this channel, not including join/leave messages
     *
     * @remarks This field will be moved to a {@link ChannelMessageCount} object when this channel is stored in Redux.
     */
    total_msg_count_root: number;
}

export type ChannelMessageCount = {

    /** The total number of posts in this channel, not including join/leave messages */
    total: number;

    /** The number of root posts in this channel, not including join/leave messages */
    root: number;
}

export type ChannelWithTeamData = Channel & {
    team_display_name: string;
    team_name: string;
    team_update_at: number;
};

export type ChannelsWithTotalCount = {
    channels: ChannelWithTeamData[];
    total_count: number;
};

export type ChannelMembership = {
    channel_id: string;
    user_id: string;
    roles: string;
    last_viewed_at: number;

    /** The number of posts in this channel which have been read by the user */
    msg_count: number;

    /** The number of root posts in this channel which have been read by the user */
    msg_count_root: number;

    /** The number of unread mentions in this channel */
    mention_count: number;

    /** The number of unread mentions in root posts in this channel */
    mention_count_root: number;

    notify_props: Partial<ChannelNotifyProps>;
    last_update_at: number;
    scheme_user: boolean;
    scheme_admin: boolean;
    post_root_id?: string;
};

export type ChannelUnread = {
    channel_id: string;
    user_id: string;
    team_id: string;

    /** The number of posts which have been read by the user */
    msg_count: number;

    /** The number of root posts which have been read by the user */
    msg_count_root: number;

    /** The number of unread mentions in this channel */
    mention_count: number;

    /** The number of unread mentions in root posts in this channel */
    mention_count_root: number;

    last_viewed_at: number;
    deltaMsgs: number;
};

export type ChannelsState = {
    currentChannelId: string;
    channels: IDMappedObjects<Channel>;
    channelsInTeam: RelationOneToMany<Team, Channel>;
    myMembers: RelationOneToOne<Channel, ChannelMembership>;
    roles: RelationOneToOne<Channel, Set<string>>;
    membersInChannel: RelationOneToOne<Channel, UserIDMappedObjects<ChannelMembership>>;
    stats: RelationOneToOne<Channel, ChannelStats>;
    groupsAssociatedToChannel: any;
    totalCount: number;
    manuallyUnread: RelationOneToOne<Channel, boolean>;
    channelModerations: RelationOneToOne<Channel, ChannelModeration[]>;
    channelMemberCountsByGroup: RelationOneToOne<Channel, ChannelMemberCountsByGroup>;
    messageCounts: RelationOneToOne<Channel, ChannelMessageCount>;
};

export type ChannelModeration = {
    name: string;
    roles: {
        guests?: {
            value: boolean;
            enabled: boolean;
        };
        members: {
            value: boolean;
            enabled: boolean;
        };
        admins: {
            value: boolean;
            enabled: boolean;
        };
    };
};

export type ChannelModerationPatch = {
    name: string;
    roles: {
        guests?: boolean;
        members?: boolean;
    };
};

export type ChannelMemberCountByGroup = {
    group_id: string;
    channel_member_count: number;
    channel_member_timezones_count: number;
};

export type ChannelMemberCountsByGroup = Record<string, ChannelMemberCountByGroup>;

export type ChannelViewResponse = {
    status: string;
    last_viewed_at_times: RelationOneToOne<Channel, number>;
};

export type ChannelSearchOpts = {
    exclude_default_channels?: boolean;
    not_associated_to_group?: string;
    team_ids?: string[];
    group_constrained?: boolean;
    exclude_group_constrained?: boolean;
    public?: boolean;
    private?: boolean;
    include_deleted?: boolean;
    deleted?: boolean;
    page?: number;
    per_page?: number;
};
