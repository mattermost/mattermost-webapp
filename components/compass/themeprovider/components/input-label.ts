// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentsOverrides} from '@mui/material/styles/overrides';
import {DefaultTheme} from '@mui/private-theming';

const componentName = 'MuiInputLabel';

export const inputLabelOverrides: ComponentsOverrides<DefaultTheme>[typeof componentName] = {
    root: {
        fontSize: '1.6rem',
        top: 6,
    },
    shrink: ({ownerState}) => ({
        ...(ownerState.shrink && {
            top: 2,
        }),
    }),
};

export default {
    styleOverrides: inputLabelOverrides,
};
