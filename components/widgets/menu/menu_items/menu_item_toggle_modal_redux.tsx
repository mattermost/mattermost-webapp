// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import classNames from 'classnames';

import ToggleModalButton from 'components/toggle_modal_button';

import menuItem from './menu_item';

type Props = {
    modalId: string;
    dialogType: React.ComponentType<any>;
    dialogProps?: Record<string, any>;
    extraText?: string;
    text?: React.ReactNode;
    ariaLabel?: string;
    className?: string;
    children?: React.ReactNode;
    sibling?: React.ReactNode;
    showUnread?: boolean;
}

export const MenuItemToggleModalReduxImpl: React.FC<Props> = ({modalId, dialogType, dialogProps, text, ariaLabel, extraText, children, className, sibling, showUnread}: Props) => (
    <>
        <ToggleModalButton
            ariaLabel={ariaLabel}
            modalId={modalId}
            dialogType={dialogType}
            dialogProps={dialogProps}
            className={classNames({
                'MenuItem__with-help': extraText,
                [`${className}`]: className,
            })}
            showUnread={showUnread}
        >
            {text && <span className='MenuItem__primary-text'>{text}</span>}
            {extraText && <span className='MenuItem__help-text'>{extraText}</span>}
            {children}
        </ToggleModalButton>
        {sibling}
    </>
);

const MenuItemToggleModalRedux = menuItem(MenuItemToggleModalReduxImpl);
MenuItemToggleModalRedux.displayName = 'MenuItemToggleModalRedux';

export default MenuItemToggleModalRedux;
