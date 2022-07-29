// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentsOverrides} from '@mui/material/styles/overrides';
import {DefaultTheme} from '@mui/private-theming';

const componentName = 'MuiListItemText';

export const listItemTextStyleOverrides: ComponentsOverrides<DefaultTheme>[typeof componentName] = {
    root: {
        margin: 0,
    },
};

export default {
    styleOverrides: listItemTextStyleOverrides,
};
