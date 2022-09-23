// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';

import {CommandPaletteEntities} from 'components/command_palette/types';
import {isMac} from 'utils/utils';

import FilterTag, {FilterTagProps} from '../filter_tag';

import './filters.scss';

type Props = {
    entities: CommandPaletteEntities[];
    intl: IntlShape;
    isBoardsEnabled: boolean;
    isCommandVisible: boolean;
    isPlaybooksEnabled: boolean;
    toggleFilter: (entity: CommandPaletteEntities) => void;
};

type Filter = Omit<FilterTagProps, 'isCommandVisible' | 'onClick'> | null;

function Filters({entities, intl, isBoardsEnabled, isCommandVisible, isPlaybooksEnabled, toggleFilter}: Props) {
    const {formatMessage} = intl;

    const filtersGroups: Filter[][] = [

        // Groups 1
        [{
            command: '~',
            entity: CommandPaletteEntities.Channel,
            isActive: entities.includes(CommandPaletteEntities.Channel),
            label: formatMessage({
                id: 'command_palette.footer.filters.channels',
                defaultMessage: 'Channels',
            }),
        }, isPlaybooksEnabled ? {
            command: '!',
            entity: CommandPaletteEntities.Playbooks,
            isActive: entities.includes(CommandPaletteEntities.Playbooks),
            label: formatMessage({
                id: 'command_palette.footer.filters.playbooks',
                defaultMessage: 'Playbooks',
            }),
        } : null, isBoardsEnabled ? {
            command: '*',
            entity: CommandPaletteEntities.Boards,
            isActive: entities.includes(CommandPaletteEntities.Boards),
            label: formatMessage({
                id: 'command_palette.footer.filters.boards',
                defaultMessage: 'Boards',
            }),
        } : null],

        // Group 2
        [{
            command: isMac() ? '⌥ + M' : 'Alt + M',
            entity: CommandPaletteEntities.Messages,
            isActive: entities.includes(CommandPaletteEntities.Messages),
            label: formatMessage({
                id: 'command_palette.footer.filters.messages',
                defaultMessage: 'Messages',
            }),
        }, {
            command: isMac() ? '⌥ + F' : 'Alt + F',
            entity: CommandPaletteEntities.Files,
            isActive: entities.includes(CommandPaletteEntities.Files),
            label: formatMessage({
                id: 'command_palette.footer.filters.files',
                defaultMessage: 'Files',
            }),
        }],

        // Group 3
        [{
            command: '>',
            entity: CommandPaletteEntities.GoTo,
            isActive: entities.includes(CommandPaletteEntities.GoTo),
            label: formatMessage({
                id: 'command_palette.footer.filters.goto',
                defaultMessage: 'GoTo',
            }),
        }],
    ];

    const renderFilters = (group: Filter[]) => {
        return group.map((filter) => {
            if (filter === null) {
                return null;
            }
            return (
                <FilterTag
                    {...filter}
                    key={filter.label}
                    isCommandVisible={isCommandVisible}
                    onClick={toggleFilter}
                />
            );
        });
    };

    const renderFiltersGroups = () => {
        return filtersGroups.map((group, index) => {
            return (
                <>
                    {renderFilters(group)}
                    {index !== filtersGroups.length - 1 && (
                        <div className='command-palette-filters-divider'/>
                    )}
                </>
            );
        });
    };

    return (
        <div className='command-palette-filters-base'>
            <div className='command-palette-filters-heading'>
                <FormattedMessage
                    id='command_palette.footer.filters.heading'
                    defaultMessage="I'M LOOKING FOR..."
                />
            </div>
            <div className='command-palette-filters'>
                {renderFiltersGroups()}
            </div>
        </div>
    );
}

export default injectIntl(Filters);
