// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Theme} from '@mui/material';
import type {ComponentsOverrides} from '@mui/material/styles/overrides';

const componentName = 'MuiInputBase';

declare module '@mui/material/InputBase' {
    interface InputBasePropsSizeOverrides {
        large: true;
    }
}

const styleOverrides: ComponentsOverrides<Theme>[typeof componentName] = {
    root: {
        fontSize: 'inherit',
        lineHeight: 'inherit',
    },
};

const overrides = {
    styleOverrides,
};

export default overrides;
