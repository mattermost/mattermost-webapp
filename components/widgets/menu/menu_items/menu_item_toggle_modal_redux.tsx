// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';

import menuItem from './menu_item';

type Props = {
    modalId: string;
    dialogType: React.ComponentType<any>;
    dialogProps?: object;
    extraText?: string;
    text: React.ReactNode;
}

export const MenuItemToggleModalReduxImpl: React.FC<Props> = ({modalId, dialogType, dialogProps, text, extraText}: Props) => (
    <ToggleModalButtonRedux
        accessibilityLabel={text}
        modalId={modalId}
        dialogType={dialogType}
        dialogProps={dialogProps}
        className={extraText && 'MenuItem__help'}
    >
        {text}
        {extraText && <span className='extra-text'>{extraText}</span>}
    </ToggleModalButtonRedux>
);

const MenuItemToggleModalRedux = menuItem(MenuItemToggleModalReduxImpl);
MenuItemToggleModalRedux.displayName = 'MenuItemToggleModalRedux';

export default MenuItemToggleModalRedux;
