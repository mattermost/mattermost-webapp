// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentsOverrides} from '@mui/material/styles/overrides';
import {DefaultTheme} from '@mui/private-theming';

const componentName = 'MuiListItemSecondaryAction';

export const listItemSecondaryActionOverrides: ComponentsOverrides<DefaultTheme>[typeof componentName] = {
    root: {
        right: 32,
    },
};

export default {
    styleOverrides: listItemSecondaryActionOverrides,
};
