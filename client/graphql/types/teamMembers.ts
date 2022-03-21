// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {User, Role} from './user';

export interface TeamMember {
    team: Team;
    user: User;
    roles: Role[];
    deleteAt: number;
    schemeGuest: boolean;
    schemeUser: boolean;
    schemeAdmin: boolean;
}

interface Team {
    id: string;
    displayName: string;
    name: string;
    updateAt: number;
    description: string;
    email: string;
    type: string;
    companyName: string;
    allowedDomains: string;
    inviteId: string;
    lastTeamIconUpdate: number;
    groupConstrained: boolean | null;
    allowOpenInvite: boolean;
}
