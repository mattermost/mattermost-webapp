// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentsOverrides} from '@mui/material/styles/overrides';
import {DefaultTheme} from '@mui/private-theming';

const componentName = 'MuiListItemButton';

export const listItemButtonOverrides: ComponentsOverrides<DefaultTheme>[typeof componentName] = {
    dense: {
        paddingTop: 0,
        paddingBottom: 0,
    },
};

export default {
    styleOverrides: listItemButtonOverrides,
};
