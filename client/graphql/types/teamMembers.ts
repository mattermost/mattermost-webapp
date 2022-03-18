// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export interface TeamMembers {
    team: Team[];
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
