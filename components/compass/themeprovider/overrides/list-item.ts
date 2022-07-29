// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentsOverrides} from '@mui/material/styles/overrides';
import {DefaultTheme} from '@mui/private-theming';

const componentName = 'MuiListItem';

export const listItemOverrides: ComponentsOverrides<DefaultTheme>[typeof componentName] = {
    root: {
        padding: '18px 64px 18px 32px',
    },
};

export default {
    styleOverrides: listItemOverrides,
};
