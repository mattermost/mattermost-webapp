// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Dictionary} from 'mattermost-redux/types/utilities';

import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';

import menuItem from './menu_item';

type Props = {
    modalId: string;
    dialogType: React.ComponentType<any>;
    dialogProps?: Dictionary<any>;
    extraText?: string;
    text: string;
}

export const MenuItemToggleModalReduxImpl: React.FC<Props> = ({modalId, dialogType, dialogProps, text, extraText}: Props) => (
    <ToggleModalButtonRedux
        accessibilityLabel={text}
        modalId={modalId}
        dialogType={dialogType}
        dialogProps={dialogProps}
        className={extraText && 'MenuItem__with-help'}
    >
        {text && <span className='MenuItem__primary-text'>{text}</span>}
        {extraText && <span className='MenuItem__help-text'>{extraText}</span>}
    </ToggleModalButtonRedux>
);

const MenuItemToggleModalRedux = menuItem(MenuItemToggleModalReduxImpl);
MenuItemToggleModalRedux.displayName = 'MenuItemToggleModalRedux';

export default MenuItemToggleModalRedux;
