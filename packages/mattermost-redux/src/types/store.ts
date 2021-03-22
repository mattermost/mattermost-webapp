// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AdminState} from './admin';
import {Bot} from './bots';
import {ChannelsState} from './channels';
import {ChannelCategoriesState} from './channel_categories';
import {CloudState} from './cloud';
import {EmojisState} from './emojis';
import {FilesState} from './files';
import {GeneralState} from './general';
import {GroupsState} from './groups';
import {IntegrationsState} from './integrations';
import {JobsState} from './jobs';
import {PostsState} from './posts';
import {PreferenceType} from './preferences';
import {
    AdminRequestsStatuses, ChannelsRequestsStatuses,
    FilesRequestsStatuses, GeneralRequestsStatuses,
    JobsRequestsStatuses, PostsRequestsStatuses,
    RolesRequestsStatuses, TeamsRequestsStatuses,
    UsersRequestsStatuses,
} from './requests';
import {Role} from './roles';
import {SchemesState} from './schemes';
import {SearchState} from './search';
import {TeamsState} from './teams';
import {ThreadsState} from './threads';
import {Typing} from './typing';
import {UsersState} from './users';
import {Dictionary} from './utilities';
import {AppsState} from './apps';

export type GlobalState = {
    entities: {
        general: GeneralState;
        users: UsersState;
        teams: TeamsState;
        channels: ChannelsState;
        posts: PostsState;
        threads: ThreadsState;
        bots: {
            accounts: Dictionary<Bot>;
        };
        preferences: {
            myPreferences: {
                [x: string]: PreferenceType;
            };
        };
        admin: AdminState;
        jobs: JobsState;
        search: SearchState;
        integrations: IntegrationsState;
        files: FilesState;
        emojis: EmojisState;
        typing: Typing;
        roles: {
            roles: {
                [x: string]: Role;
            };
            pending: Set<string>;
        };
        schemes: SchemesState;
        gifs: any;
        groups: GroupsState;
        channelCategories: ChannelCategoriesState;
        apps: AppsState;
        cloud: CloudState;
    };
    errors: any[];
    requests: {
        channels: ChannelsRequestsStatuses;
        general: GeneralRequestsStatuses;
        posts: PostsRequestsStatuses;
        teams: TeamsRequestsStatuses;
        users: UsersRequestsStatuses;
        admin: AdminRequestsStatuses;
        files: FilesRequestsStatuses;
        roles: RolesRequestsStatuses;
        jobs: JobsRequestsStatuses;
    };
    websocket: {
        connected: boolean;
        lastConnectAt: number;
        lastDisconnectAt: number;
    };
};
