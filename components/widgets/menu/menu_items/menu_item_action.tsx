// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import menuItem from './menu_item';

type Props = {
    onClick: (e: React.MouseEvent) => void;
    ariaLabel?: string;
    text: React.ReactNode;
    extraText?: string;
    id?: string;
    buttonClass?: string;
    isDangerous?: boolean;
}
export const MenuItemActionImpl = ({onClick, ariaLabel, text, extraText, id, buttonClass, isDangerous}: Props) => (
    <button
        id={id}
        aria-label={ariaLabel}
        className={'style--none' + (extraText ? ' MenuItem__help' : '') + (buttonClass ? ' ' + buttonClass : '') + (isDangerous ? ' MenuItem__dangerous' : '')}
        onClick={onClick}
    >
        {text}
        {extraText && <span className='extra-text'>{extraText}</span>}
    </button>
);

const MenuItemAction = menuItem(MenuItemActionImpl);
MenuItemAction.displayName = 'MenuItemAction';

export default MenuItemAction;
