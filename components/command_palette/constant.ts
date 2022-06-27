// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {CommandPaletteItem} from './command_palette_list_item/command_palette_list_item';
import {CmdPalettePictographType} from './command_palette_list_item/command_palette_list_item_pictograph';
import {CommandPaletteEntities, GotoType} from './types';

export const GotoListItemConstants = {
    CUSTOM_STATUS: 'Set a custom status',
    PROFILE_SETTINGS: 'Profile settings',
    DISPLAY_SETTINGS: 'Display settings',
    INVITE_PEOPLE: 'Invite people',
    USER_GROUPS: 'User groups',
    NOTIFICATION_SETTINGS: 'Notification settings',
};

export const GotoListItemData: CommandPaletteItem[] = [
    {
        description: '',
        id: 'goto-1',
        isDeactivated: false,
        teamName: '',
        pictograph: {
            type: CmdPalettePictographType.GOTO_ICON,
            pictographItem: 'icon-emoticon-plus-outline',
        },
        title: GotoListItemConstants.CUSTOM_STATUS,
        type: CommandPaletteEntities.GoTo,
        teamId: '',
        subType: GotoType.OPEN,
    },
    {
        description: '',
        id: 'goto-2',
        isDeactivated: false,
        teamName: '',
        pictograph: {
            type: CmdPalettePictographType.GOTO_ICON,
            pictographItem: 'icon-account-outline',
        },
        title: GotoListItemConstants.PROFILE_SETTINGS,
        type: CommandPaletteEntities.GoTo,
        teamId: '',
        subType: GotoType.OPEN,
    },
    {
        description: '',
        id: 'goto-3',
        isDeactivated: false,
        teamName: '',
        pictograph: {
            type: CmdPalettePictographType.GOTO_ICON,
            pictographItem: 'icon-eye-outline',
        },
        title: GotoListItemConstants.DISPLAY_SETTINGS,
        type: CommandPaletteEntities.GoTo,
        teamId: '',
        subType: GotoType.OPEN,
    },
    {
        description: '',
        id: 'goto-4',
        isDeactivated: false,
        teamName: '',
        pictograph: {
            type: CmdPalettePictographType.GOTO_ICON,
            pictographItem: 'icon-account-plus-outline',
        },
        title: GotoListItemConstants.INVITE_PEOPLE,
        type: CommandPaletteEntities.GoTo,
        teamId: '',
        subType: GotoType.OPEN,
    },
    {
        description: '',
        id: 'goto-5',
        isDeactivated: false,
        teamName: '',
        pictograph: {
            type: CmdPalettePictographType.GOTO_ICON,
            pictographItem: 'icon-account-multiple-outline',
        },
        title: GotoListItemConstants.INVITE_PEOPLE,
        type: CommandPaletteEntities.GoTo,
        teamId: '',
        subType: GotoType.OPEN,
    },
    {
        description: '',
        id: 'goto-6',
        isDeactivated: false,
        teamName: '',
        pictograph: {
            type: CmdPalettePictographType.GOTO_ICON,
            pictographItem: 'icon-alert-circle-outline',
        },
        title: GotoListItemConstants.NOTIFICATION_SETTINGS,
        type: CommandPaletteEntities.GoTo,
        teamId: '',
        subType: GotoType.OPEN,
    },
];
