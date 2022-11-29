// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

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

// --away-indicator: #ffbc42;
// --away-indicator-dark: #c79e3f;
// --button-bg: #166de0;
// --button-color: #fff;
// --center-channel-bg: #fff;
// --center-channel-color: #3d3c40;
// --dnd-indicator: #d24b4e;
// --error-text: #d24b4e;
// --warning-text: #cc8f00;
// --link-color: #2389d7;
// --mention-bg: #fff;
// --mention-color: #145dbf;
// --mention-highlight-bg: #ffe577;
// --mention-highlight-link: #166de0;
// --new-message-separator: #f80;
// --online-indicator: #06d6a0;
// --sidebar-bg: #145dbf;
// --sidebar-header-bg: #1153ab;
// --sidebar-header-text-color: #fff;
// --sidebar-text: #fff;
// --sidebar-text-active-border: #579eff;
// --sidebar-text-active-color: #fff;
// --sidebar-text-hover-bg: #4578bf;
// --sidebar-unread-text: #fff;
// --sidebar-team-background: #0b428c;
// --secondary-blue: #22406d;
// --denim-button-bg: #1c58d9;
// --denim-status-online: #3db887;
// --denim-sidebar-active-border: #5d89ea;
// --center-channel-text: #3f4350;
// --title-color-indigo-500: #1e325c;

const defaultTheme = {
    palette: {
        primary: {main: '#166de0'},
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
    },
};

export {
    defaultTheme,
};
