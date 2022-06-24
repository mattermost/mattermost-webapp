// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import classNames from 'classnames';

// See LICENSE.txt for license information.
import React, {useCallback, useEffect, useState} from 'react';

import Constants from 'utils/constants';
import {isKeyPressed} from 'utils/utils';

import {CommandPaletteItem, CommandPaletteListItem} from '../command_palette_list_item/command_palette_list_item';

import './command_palette_list.scss';

type Props = {
    itemList: CommandPaletteItem[];
    onItemSelected: (item: CommandPaletteItem) => void;
}
export const CommandPaletteList = ({itemList, onItemSelected}: Props) => {
    const [selectedItemIndex, setSelectedItemIndex] = useState(0);
    const KeyCodes = Constants.KeyCodes;

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (isKeyPressed(e, KeyCodes.UP)) {
            if (selectedItemIndex > 0) {
                setSelectedItemIndex(selectedItemIndex - 1);
            }
            e.preventDefault();
        } else if (isKeyPressed(e, KeyCodes.DOWN)) {
            setSelectedItemIndex(selectedItemIndex + 1);
            e.preventDefault();
        }
    }, [selectedItemIndex]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const list = itemList.map((item, index) => {
        return (
            <li
                key={item.id}
                className={classNames('cmd-pl-list-item', {
                    'cmd-pl-list-item--selected': selectedItemIndex === index,
                })}
                onClick={() => onItemSelected(item)}
            >
                <CommandPaletteListItem
                    key={item.id}
                    {...item}
                />
            </li>
        );
    });
    return (
        <ul className={'cmd-pl-list'}>
            {list}
        </ul>
    );
};
