// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {createTheme} from '@mui/material/styles';
import MUIThemeProvider, {ThemeProviderProps} from '@mui/material/styles/ThemeProvider';

import componentOverrides from './component-overrides';
import typographyOverrides from './typography';

const Themeprovider = ({theme, ...rest}: ThemeProviderProps) => {
    const combinedTheme = createTheme({
        ...theme,
        typography: typographyOverrides,
        components: componentOverrides,
    });

    return (
        <MUIThemeProvider
            {...rest}
            theme={combinedTheme}
        />
    );
};

export default Themeprovider;
