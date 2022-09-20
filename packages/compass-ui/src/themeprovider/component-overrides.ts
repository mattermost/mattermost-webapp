// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ThemeOptions} from '@mui/material/styles/createTheme';

import MuiIconButtonOverrides from '../components/icon-button/icon-button.styles';
import MuiMenuItemOverrides from '../components/menu-item/menu-item.styles';
import MuiButtonOverrides from '../components/button/button.styles';
import MuiButtonBaseOverrides from '../components/button/button-base.styles';
import MuiListItemOverrides from '../components/list-item/list-item.styles';
import MuiListItemTextOverrides from '../components/list-item/list-item-text.styles';
import MuiListItemIconOverrides from '../components/list-item/list-item-icon.styles';
import MuiListItemButtonOverrides from '../components/list-item/list-item-button.styles';
import MuiListItemSecondaryActionOverrides from '../components/list-item/list-item-secondary-action.styles';
import MuiMenuOverrides from '../components/menu/menu.styles';
import MuiSelectOverrides from '../components/select/select.styles';
import MuiInputOverrides from '../components/input/input.styles';
import MuiInputLabelOverrides from '../components/input/input-label.styles';
import MuiOutlinedInputOverrides from '../components/input/outlined-input.styles';

const componentOverrides: ThemeOptions['components'] = {
    MuiInput: MuiInputOverrides,
    MuiInputLabel: MuiInputLabelOverrides,
    MuiOutlinedInput: MuiOutlinedInputOverrides,
    MuiSelect: MuiSelectOverrides,
    MuiMenu: MuiMenuOverrides,
    MuiMenuItem: MuiMenuItemOverrides,
    MuiListItem: MuiListItemOverrides,
    MuiListItemText: MuiListItemTextOverrides,
    MuiListItemIcon: MuiListItemIconOverrides,
    MuiListItemButton: MuiListItemButtonOverrides,
    MuiButton: MuiButtonOverrides,
    MuiButtonBase: MuiButtonBaseOverrides,
    MuiIconButton: MuiIconButtonOverrides,
    MuiListItemSecondaryAction: MuiListItemSecondaryActionOverrides,
};

export default componentOverrides;
