// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, KeyboardEvent} from 'react';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';

import {CommandPaletteEntities} from 'components/command_palette/types';

import Chip from '../chip';

import './input.scss';

type Props = {
    chips: string[];
    entities: CommandPaletteEntities[];
    intl: IntlShape;
    isCommandVisible: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    removeChip: (chipIndex: number) => void;
    searchPrefix: string;
    searchTerm: string;
    toggleCommandVisibility: () => void;
}

function Input({chips, entities, intl, isCommandVisible, onChange, onKeyDown, removeChip, searchPrefix, searchTerm, toggleCommandVisibility}: Props) {
    // Render the list of chips
    const renderChips = chips.map((label, index) => (
        <Chip
            index={index}
            key={label}
            label={label}
            onRemove={removeChip}
        />
    ));

    // Render the input
    const renderInput = (
        <input
            autoFocus={true}
            type='text'
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder={getInputPlaceholder({intl, entities, chips, searchPrefix, searchTerm})}
            value={searchTerm}
        />
    );

    const renderShortCut = () => {
        if (chips.length) {
            return null;
        }

        if (isCommandVisible) {
            return (
                <FormattedMessage
                    id='command_palette.input.shortcut.hide'
                    defaultMessage='Press {link} to view shortcuts'
                    values={{
                        link: (
                            <a onClick={toggleCommandVisibility}>
                                <FormattedMessage
                                    id='command_palette.input.shortcut.delete'
                                    defaultMessage='delete'
                                />
                            </a>
                        ),
                    }}
                />
            );
        }
        return (
            <FormattedMessage
                id='command_palette.input.shortcut'
                defaultMessage='Press {link} to hide shortcuts'
                values={{
                    link: (
                        <a onClick={toggleCommandVisibility}>
                            {'?'}
                        </a>
                    ),
                }}
            />
        );
    };

    return (
        <div className='command-palette-input-base'>
            <i className='icon icon-magnify icon-24'/>
            <div className='command-palette-input'>
                {renderChips}
                <div className='command-palette-search-prefix'>
                    {searchPrefix}
                </div>
                {renderInput}
                <div className='command-palette-input-shortcut'>
                    {renderShortCut()}
                </div>
            </div>
        </div>
    );
}

type InputPlaceholder = Pick<Props, 'chips' | 'entities' | 'searchPrefix' | 'searchTerm'> & {
    intl: IntlShape;
}

function getInputPlaceholder({intl, entities, chips, searchPrefix, searchTerm}: InputPlaceholder): string {
    if (chips.length > 0) {
        return '';
    }

    const {formatMessage} = intl;

    if (!searchTerm && searchPrefix) {
        if (searchPrefix === '~') {
            return formatMessage({
                id: 'command_palette.input.placeholder.channel',
                defaultMessage: 'Search for a channel or direct message...',
            });
        }
        if (searchPrefix === '!') {
            return formatMessage({
                id: 'command_palette.input.placeholder.playbook',
                defaultMessage: 'Search for a playbook or playbook run...',
            });
        }
        if (searchPrefix === '*') {
            return formatMessage({
                id: 'command_palette.input.placeholder.board',
                defaultMessage: 'Search for a board...',
            });
        }
    }

    if (chips.length === 1 && entities.includes(CommandPaletteEntities.GoTo)) {
        return formatMessage({
            id: 'command_palette.input.placeholder.goto',
            defaultMessage: 'Go to any menu option',
        });
    }

    if (chips.length === 1 && entities.includes(CommandPaletteEntities.Messages)) {
        return formatMessage({
            id: 'command_palette.input.placeholder.messages',
            defaultMessage: 'Use modifiers to focus your search...',
        });
    }

    return formatMessage({
        id: 'command_palette.input.placeholder.general',
        defaultMessage: 'What can we help you with?',
    });
}

export default injectIntl(Input);
