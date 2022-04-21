// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import classNames from 'classnames';

import RenderEmoji from 'components/emoji/render_emoji';
import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';

import {ChannelType, BoardsType, CommandPaletteEntities, PlaybooksType} from '../types';

import {CmdPalettePictograph, CommandPaletteListItemPictograph} from './command_palette_list_item_pictograph';

import './command_palette_list_item.scss';

export interface CommandPaletteItem {
    title: string;
    description: string;
    id: string;
    pictograph: CmdPalettePictograph;
    teamName?: string;
    mentionBadge?: number;
    isBot?: boolean;
    isGuest?: boolean;
    customStatus?: string;
    isArchived?: boolean;
    lastViewedAt?: number;
    isDeactivated?: boolean;
    type: CommandPaletteEntities;
    subType: ChannelType | BoardsType | PlaybooksType;
    isSelected?: boolean;
}

export const CommandPaletteListItem = ({
    description,
    title,
    pictograph,
    isGuest,
    isBot,
    mentionBadge,
    teamName,
    customStatus,
    isSelected,
}: CommandPaletteItem) => {
    return (
        <li
            className={classNames('cmd-pl-list-item', {
                'cmd-pl-list-item--selected': isSelected,
            })}
        >
            <CommandPaletteListItemPictograph
                pictographItem={pictograph.pictographItem}
                type={pictograph.type}
                userStatus={pictograph.userStatus}
            />
            <span className={'cmd-pl-list-item__title'}>{title}</span>
            <span className={'cmd-pl-list-item__desc'}>{description}</span>
            {customStatus &&
                <div className={'cmd-pl-list-item__customStatus'}>
                    <RenderEmoji
                        emojiName={customStatus}
                    />
                </div>
            }
            {isBot &&
                <BotBadge
                    show={true}
                    className='cmd-pl-list-item__bot-badge'
                />
            }
            {isGuest &&
                <GuestBadge
                    show={true}
                    className='cmd-pl-list-item__guest-badge'
                />
            }
            <span/>
            {mentionBadge &&
                <span className={'cmd-pl-list-item__mention-badge'}>
                    {mentionBadge}
                </span>}
            {teamName &&
                <div className={'cmd-pl-list-item__team-name'}>
                    <span>{teamName}</span>
                </div>}
        </li>
    );
};
