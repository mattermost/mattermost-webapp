// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Channel} from '@mattermost/types/channels';
import {Team} from '@mattermost/types/teams';

// See LICENSE.txt for license information.
import {CommandPaletteItem} from './command_palette_list_item/command_palette_list_item';
import {
    CmdPalettePictographIcon,
    CmdPalettePictographType,
} from './command_palette_list_item/command_palette_list_item_pictograph';
import {BoardsType, ChannelType, CommandPaletteEntities} from './types';
export type Board = {
    channelId: string;
    createAt: number;
    createdBy: string;
    deleteAt: number;
    description: string;
    icon: string;
    id: string;
    isTemplate: boolean;
    minimumRole: string;
    modifiedBy: string;
    showDescription: boolean;
    teamId: string;
    templateVersion: number;
    title: string;
    type: BoardsType;
    updateAt: number;
}

const channelTypeOrder = {
    [ChannelType.OPEN_CHANNEL]: 0,
    [ChannelType.PRIVATE_CHANNEL]: 1,
    [ChannelType.DM_CHANNEL]: 2,
    [ChannelType.GM_CHANNEL]: 3,
};

function filterName(name: string): string {
    return name.replace(/[.,'"\/#!$%\^&\*;:{}=\-_`~()]/g, ''); // eslint-disable-line no-useless-escape
}

export function boardToCommandPaletteItemTransformer(boards: Board[], teams: Record<string, Team>): CommandPaletteItem[] {
    return boards.filter(((b) => !b.isTemplate)).map((board) => {
        const isArchived = board.deleteAt ? board.deleteAt !== 0 : false;

        let channelIcon = CmdPalettePictographIcon.GLOBE;
        if (isArchived) {
            channelIcon = CmdPalettePictographIcon.ARCHIVE;
        }
        return {
            description: '',
            id: board.id,
            isDeactivated: isArchived,
            teamName: teams[board.teamId]?.name,
            pictograph: {
                type: CmdPalettePictographType.TEXT,
                pictographItem: board.icon.toString(),
            },
            subType: board.type as BoardsType,
            title: board.title,
            type: CommandPaletteEntities.Boards,
            isArchived,
        };
    });
}

export function channelToCommandPaletteItemTransformer(channels: Channel[], teams: Record<string, Team>): CommandPaletteItem[] {
    return channels.map((channel) => {
        const isArchived = channel.delete_at ? channel.delete_at !== 0 : false;

        let channelIcon = CmdPalettePictographIcon.GLOBE;
        if (isArchived) {
            channelIcon = CmdPalettePictographIcon.ARCHIVE;
        }
        return {
            description: channel.type === ChannelType.DM_CHANNEL ? channel.name : '',
            id: channel.id,
            isDeactivated: isArchived,
            teamName: teams[channel.team_id]?.name,
            pictograph: {
                type: CmdPalettePictographType.ICON,
                pictographItem: channelIcon,
            },
            subType: channel.type as ChannelType,
            title: channel.display_name,
            type: CommandPaletteEntities.Channel,
            isArchived,
        };
    });
}

function sortChannelsByTypeAndDisplayName(locale: string, cmdPaletteItemA: CommandPaletteItem, cmdPaletteItemB: CommandPaletteItem): number {
    if (channelTypeOrder[cmdPaletteItemA.subType] !== channelTypeOrder[cmdPaletteItemB.subType]) {
        if (channelTypeOrder[cmdPaletteItemA.subType] < channelTypeOrder[cmdPaletteItemB.subType]) {
            return -1;
        }

        return 1;
    }

    const aDisplayName = filterName(cmdPaletteItemA.title);
    const bDisplayName = filterName(cmdPaletteItemB.title);

    if (aDisplayName !== bDisplayName) {
        return aDisplayName.toLowerCase().localeCompare(bDisplayName.toLowerCase(), locale, {numeric: true});
    }

    return cmdPaletteItemA.title.toLowerCase().localeCompare(cmdPaletteItemA.title.toLowerCase(), locale, {numeric: true});
}

function sortChannelsByRecencyAndTypeAndDisplayName(cmdPaletteItemA: CommandPaletteItem, cmdPaletteItemB: CommandPaletteItem) {
    if (cmdPaletteItemA.lastViewedAt && cmdPaletteItemB.lastViewedAt) {
        return cmdPaletteItemB.lastViewedAt - cmdPaletteItemA.lastViewedAt;
    } else if (cmdPaletteItemA.lastViewedAt) {
        return -1;
    } else if (cmdPaletteItemB.lastViewedAt) {
        return 1;
    }

    // MM-12677 When this is migrated this needs to be fixed to pull the user's locale
    return sortChannelsByTypeAndDisplayName('en', cmdPaletteItemA, cmdPaletteItemB);
}

export function commandPaletteSorter(prefix: string, cmdPaletteItemA: CommandPaletteItem, cmdPaletteItemB: CommandPaletteItem) {
    if (cmdPaletteItemA.isArchived && !cmdPaletteItemB.isArchived) {
        return 1;
    } else if (!cmdPaletteItemA.isArchived && cmdPaletteItemB.isArchived) {
        return -1;
    }

    if (cmdPaletteItemA.isDeactivated && !cmdPaletteItemB.isDeactivated) {
        return 1;
    } else if (cmdPaletteItemB.isDeactivated && !cmdPaletteItemA.isDeactivated) {
        return -1;
    }

    let aDisplayName = cmdPaletteItemA.title.toLowerCase();
    let bDisplayName = cmdPaletteItemA.title.toLowerCase();

    if (cmdPaletteItemA.type === CommandPaletteEntities.Channel &&
        cmdPaletteItemA.subType === ChannelType.DM_CHANNEL &&
        aDisplayName.startsWith('@')) {
        aDisplayName = aDisplayName.substring(1);
    }

    if (cmdPaletteItemB.type === CommandPaletteEntities.Channel &&
        cmdPaletteItemB.subType === ChannelType.DM_CHANNEL && bDisplayName.startsWith('@')) {
        bDisplayName = bDisplayName.substring(1);
    }

    const aStartsWith = aDisplayName.startsWith(prefix) || cmdPaletteItemA.description.toLowerCase().startsWith(prefix);
    const bStartsWith = bDisplayName.startsWith(prefix) || cmdPaletteItemB.description.toLowerCase().startsWith(prefix);

    // Open channels user haven't interacted should be at the  bottom of the list
    if (cmdPaletteItemA.type === CommandPaletteEntities.Channel &&
        cmdPaletteItemA.subType === ChannelType.OPEN_CHANNEL &&
        !cmdPaletteItemA.lastViewedAt &&
        ((cmdPaletteItemB.type === CommandPaletteEntities.Channel &&
            cmdPaletteItemB.subType !== ChannelType.OPEN_CHANNEL) || cmdPaletteItemB.lastViewedAt)) {
        return 1;
    } else if ((cmdPaletteItemB.type === CommandPaletteEntities.Channel &&
        cmdPaletteItemB.subType === ChannelType.OPEN_CHANNEL) || !cmdPaletteItemB.lastViewedAt) {
        return -1;
    }

    // Sort channels starting with the search term first
    if (aStartsWith && !bStartsWith) {
        return -1;
    } else if (!aStartsWith && bStartsWith) {
        return 1;
    }
    return sortChannelsByRecencyAndTypeAndDisplayName(cmdPaletteItemA, cmdPaletteItemB);
}
