// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useCallback, useEffect, useState} from 'react';

import './command_palette_list.scss';
import Constants from 'utils/constants';
import {isKeyPressed} from 'utils/utils';

import {CommandPaletteItem, CommandPaletteListItem} from '../command_palette_list_item/command_palette_list_item';
type Props = {
    itemList: CommandPaletteItem[];
}
export const CommandPaletteList = ({itemList}: Props) => {
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
            <CommandPaletteListItem
                key={item.id}
                {...item}
                isSelected={selectedItemIndex === index}
            />
        );
    });
    return (
        <ul className={'cmd-pl-list'}>
            {list}
        </ul>
    );
};
