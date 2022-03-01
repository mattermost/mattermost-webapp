// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';

import menuItem from './menu_item';

type Props = {
    onClick: (e: React.MouseEvent) => void;
    ariaLabel?: string;
    text: React.ReactNode;
    extraText?: string;
    id?: string;
    buttonClass?: string;
    rightDecorator?: React.ReactNode;
    isDangerous?: boolean;
}
export const MenuItemActionImpl = ({
    onClick,
    ariaLabel,
    text,
    extraText,
    id,
    buttonClass,
    rightDecorator,
    isDangerous,
}: Props) => (
    <button
        data-testid={id}
        id={id}
        aria-label={ariaLabel}
        className={
            classNames([
                'style--none',
                {
                    'MenuItem__with-help': extraText,
                    [`${buttonClass}`]: buttonClass,
                    MenuItem__dangerous: isDangerous,
                },
            ])
        }
        onClick={onClick}
    >
        {text && <span className='MenuItem__primary-text'>{text}{rightDecorator}</span>}
        {extraText && <span className='MenuItem__help-text'>{extraText}</span>}
    </button>
);

const MenuItemAction = menuItem(MenuItemActionImpl);
MenuItemAction.displayName = 'MenuItemAction';

export default MenuItemAction;
