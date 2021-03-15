// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Dictionary} from 'mattermost-redux/types/utilities';

import classNames from 'classnames';

import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';

import menuItem from './menu_item';

type Props = {
    modalId: string;
    dialogType: React.ComponentType<any>;
    dialogProps?: Dictionary<any>;
    extraText?: string;
    text: string;
    accessibilityLabel?: string;
    className?: string;
    children?: React.ReactNode;
    sibling?: React.ReactNode;
}

export const MenuItemToggleModalReduxImpl: React.FC<Props> = ({modalId, dialogType, dialogProps, text, accessibilityLabel, extraText, children, className, sibling}: Props) => (
    <>
        <ToggleModalButtonRedux
            accessibilityLabel={accessibilityLabel || text}
            modalId={modalId}
            dialogType={dialogType}
            dialogProps={dialogProps}
            className={classNames({
                'MenuItem__with-help': extraText,
                [`${className}`]: className,
            })}
        >
            {text && <span className='MenuItem__primary-text'>{text}</span>}
            {extraText && <span className='MenuItem__help-text'>{extraText}</span>}
            {children}
        </ToggleModalButtonRedux>
        {sibling}
    </>
);

const MenuItemToggleModalRedux = menuItem(MenuItemToggleModalReduxImpl);
MenuItemToggleModalRedux.displayName = 'MenuItemToggleModalRedux';

export default MenuItemToggleModalRedux;
