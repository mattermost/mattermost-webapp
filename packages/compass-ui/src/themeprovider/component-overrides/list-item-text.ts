// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type { ComponentsOverrides } from '@mui/material/styles/overrides';
import type { DefaultTheme } from '@mui/private-theming';

const componentName = 'MuiListItemText';

const listItemTextStyleOverrides: ComponentsOverrides<DefaultTheme>[typeof componentName] = {
    root: {
        margin: 0,
    },
};

const overrides = {
    styleOverrides: listItemTextStyleOverrides,
};

export default overrides;
