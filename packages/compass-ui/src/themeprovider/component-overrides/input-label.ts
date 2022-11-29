// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ComponentsOverrides} from '@mui/material/styles/overrides';
import type {DefaultTheme} from '@mui/private-theming';

const componentName = 'MuiInputLabel';

declare module '@mui/material/InputLabel' {
    interface InputLabelProps {
        withStartIcon?: boolean;
    }
}

const inputLabelStyleOverrides: ComponentsOverrides<DefaultTheme>[typeof componentName] = {
    root: ({ownerState}) => ({
        fontSize: '1.6rem',
        top: 6,

        '&:not(.MuiInputLabel-shrink)': {
            transform: ownerState.withStartIcon ? 'translate(40px, 0.8rem)' : 'translate(24px, 0.8rem)',
        },
    }),
    shrink: ({ownerState}) => ({
        ...(ownerState.shrink ? {
            top: 2,
        } : {}),
    }),
};

const overrides = {
    styleOverrides: inputLabelStyleOverrides,
};

export default overrides;
