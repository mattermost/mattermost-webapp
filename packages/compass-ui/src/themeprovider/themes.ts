// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import createPalette from '@mui/material/styles/createPalette';

declare module '@mui/material/styles' {
    interface Palette {
        mention?: Palette['primary'];
    }
    interface PaletteOptions {
        mention?: PaletteOptions['primary'];
    }

    interface PaletteColor {
        darker?: string;
    }
    interface SimplePaletteColorOptions {
        darker?: string;
    }
}

export const defaultTheme = {
    palette: createPalette({
        primary: {main: '#042657'},
        secondary: {main: '#0043ad'},
        error: {main: '#d24b4e'},
        warning: {main: '#cc8f00'},
        info: {main: '#145dbf'},
        success: {main: '#06d6a0'},
        mention: {main: '#145dbf'},
        text: {
            primary: '#3d3c40',
        },
        background: {
            default: '#fff',
        },
        tonalOffset: 0.05,
    }),
};
