// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type ReadAccess = 'read';
export const readAccess: ReadAccess = 'read';
export type WriteAccess = 'write';
export const writeAccess: WriteAccess = 'write';
export type NoAccess = false;
export const noAccess: NoAccess = false;
export type PermissionAccess = ReadAccess | WriteAccess | NoAccess;
export type PermissionsToUpdate = Record<string, ReadAccess | WriteAccess | NoAccess>;
export type PermissionToUpdate = {
    name: string;
    value: PermissionAccess;
};

// the actual permissions correlating to these values are of the format `sysconsole_(read|write)_name(.subsection.name)`
export const sectionsList: SystemSection[] = [
    {
        name: 'about',
        hasDescription: true,
        subsections: [],
    },
    {
        name: 'reporting',
        hasDescription: true,
        subsections: [],
    },
    {
        name: 'user_management',
        hasDescription: true,
        subsections: [
            {name: 'user_management_users', hasDescription: true},
            {name: 'user_management_groups'},
            {name: 'user_management_teams'},
            {name: 'user_management_channels'},
            {name: 'user_management_permissions'},
            {name: 'user_management_system_roles', disabled: true},
        ],
    },
    {
        name: 'environment',
        hasDescription: true,
        subsections: [],
    },
    {
        name: 'site',
        hasDescription: true,
        subsections: [],
    },
    {
        name: 'authentication',
        hasDescription: true,
        subsections: [],
    },
    {
        name: 'plugins',
        hasDescription: true,
        subsections: [],
    },
    {
        name: 'integrations',
        hasDescription: true,
        subsections: [],
    },
    {
        name: 'compliance',
        hasDescription: true,
        subsections: [],
    },
    {
        name: 'experimental',
        hasDescription: true,
        subsections: [],
    },
];

export type SystemSection = {
    name: string;
    hasDescription?: boolean;
    subsections?: SystemSection[];
    disabled?: boolean;
}
