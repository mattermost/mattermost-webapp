// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {createTheme} from '@mui/material/styles';
import MUIThemeProvider, {ThemeProviderProps as MUIThemeProviderProps} from '@mui/material/styles/ThemeProvider';

import componentOverrides from './overrides';

export type ThemeProviderProps = Omit<MUIThemeProviderProps, 'theme'>;

const Themeprovider = (props: ThemeProviderProps) => {
    const theme = createTheme({
        typography: {
            body1: {
                color: 'var(--center-channel-text)',
                fontSize: '1.4rem',
                lineHeight: '2rem',
            },
            body2: {
                color: 'rgba(var(--center-channel-text-rgb), 0.56)',
                fontSize: '1.4rem',
                lineHeight: '2rem',
            },
        },
        components: componentOverrides,
    });

    return (
        <MUIThemeProvider
            {...props}
            theme={theme}
        />
    );
};

export default Themeprovider;
