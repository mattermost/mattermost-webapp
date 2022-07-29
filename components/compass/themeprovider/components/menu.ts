// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentsOverrides} from '@mui/material/styles/overrides';
import {DefaultTheme} from '@mui/private-theming';

const componentName = 'MuiMenu';

export const menuItemOverrides: ComponentsOverrides<DefaultTheme>[typeof componentName] = {
    list: {
        minWidth: 100,
    },
};

export default {
    styleOverrides: menuItemOverrides,
};
