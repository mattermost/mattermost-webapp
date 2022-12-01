// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Theme} from '@mui/material';
import type {ComponentsOverrides} from '@mui/material/styles/overrides';

const componentName = 'MuiFormControl';

declare module '@mui/material/FormControl' {
    interface FormControlPropsSizeOverrides {
        large: true;
    }
}

const styleOverrides: ComponentsOverrides<Theme>[typeof componentName] = {
    root: ({ownerState, theme}) => {
        console.log('#### formcontrol ownerstate', ownerState);
        return ({
            ...(ownerState.size === 'small' && theme.typography.b75),
            ...(ownerState.size === 'medium' && theme.typography.b100),
            ...(ownerState.size === 'large' && theme.typography.b200),
            color: 'red',
            margin: 0,
        });
    },
};

const overrides = {
    styleOverrides,
};

export default overrides;
