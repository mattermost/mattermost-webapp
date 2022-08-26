// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {createTheme} from '@mui/material/styles';
import MUIThemeProvider, {ThemeProviderProps as MUIThemeProviderProps} from '@mui/material/styles/ThemeProvider';

import componentOverrides from './components';
import typographyOverrides from './typography';

export type ThemeProviderProps = Omit<MUIThemeProviderProps, 'theme'>;

const Themeprovider = (props: ThemeProviderProps) => {
    const theme = createTheme({
        typography: typographyOverrides,
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
