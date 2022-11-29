// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ThemeOptions} from '@mui/material/styles/createTheme';

import MuiButton from './button';
import MuiButtonBase from './button-base';
import MuiIconButton from './icon-button';
import MuiListItem from './list-item';
import MuiListItemText from './list-item-text';
import MuiListItemIcon from './list-item-icon';
import MuiListItemButton from './list-item-button';
import MuiListItemSecondaryAction from './list-item-secondary-action';
import MuiMenu from './menu';
import MuiMenuItem from './menu-item';
import MuiSelect from './select';
import MuiInput from './input';
import MuiInputLabel from './input-label';
import MuiOutlinedInput from './outlined-input';
import MuiInputBase from './input-base';

const componentOverrides: ThemeOptions['components'] = {
    MuiInput,
    MuiInputLabel,
    MuiOutlinedInput,
    MuiSelect,
    MuiMenu,
    MuiMenuItem,
    MuiListItem,
    MuiListItemText,
    MuiListItemIcon,
    MuiListItemButton,
    MuiButton,
    MuiButtonBase,
    MuiIconButton,
    MuiListItemSecondaryAction,
    MuiInputBase,
};

export default componentOverrides;
