// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentsOverrides} from '@mui/material/styles/overrides';
import {DefaultTheme} from '@mui/private-theming';

const componentName = 'MuiListItemIcon';

export const listItemIconStyleOverrides: ComponentsOverrides<DefaultTheme>[typeof componentName] = {
    root: {
        minWidth: 0,
        color: 'currentColor',
    },
};

export default {
    styleOverrides: listItemIconStyleOverrides,
};
