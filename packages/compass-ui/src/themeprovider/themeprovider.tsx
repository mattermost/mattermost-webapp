// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {createTheme} from '@mui/material/styles';
import MUIThemeProvider, {ThemeProviderProps} from '@mui/material/styles/ThemeProvider';

import {defaultTheme} from './themes';
import componentOverrides from './component-overrides';
import typographyOverrides from './typography-overrides';

const Themeprovider = ({theme = defaultTheme, ...rest}: ThemeProviderProps) => {
    const combinedTheme = createTheme({
        ...theme,
        components: componentOverrides,
        typography: {
            ...typographyOverrides,
            htmlFontSize: 10,
        },
    });

    return (
        <MUIThemeProvider
            {...rest}
            theme={combinedTheme}
        />
    );
};

export default Themeprovider;
