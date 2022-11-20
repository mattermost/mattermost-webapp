// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useEffect, useCallback, useRef} from 'react';

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
    index?: number;
    focus?: boolean;
    setFocus?: (e: any) => void;
    disabled?: boolean;
    sibling?: React.ReactNode;
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
    index,
    focus,
    setFocus,
    disabled,
    sibling,
}: Props) => {
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (focus) {
            // Move element into view when it is focused
            ref.current?.focus();
        }
    }, [focus]);

    useEffect(() => {
        return (() => setFocus?.(0));
    }, []);

    const handleSelect = useCallback(() => {
        // setting focus to that element when it is selected
        setFocus?.(index);
    }, [text, index, setFocus]);

    return (
        <>
            <button
                data-testid={id}
                id={id}
                aria-label={ariaLabel}
                className={classNames('style--none', buttonClass, {
                    'MenuItem__with-help': extraText,
                    'MenuItem__with-sibling': sibling,
                    disabled,
                    MenuItem__dangerous: isDangerous,
                })}
                onClick={onClick}
                disabled={disabled}
                ref={ref}
                onKeyPress={handleSelect}
            >
                {text && <span className='MenuItem__primary-text'>{text}{rightDecorator}</span>}
                {extraText && <span className='MenuItem__help-text'>{extraText}</span>}
            </button>
            {sibling}
        </>
    );
};

const MenuItemAction = menuItem(MenuItemActionImpl);
MenuItemAction.displayName = 'MenuItemAction';

export default MenuItemAction;
