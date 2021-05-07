import { neutral, green, red, blue, indigo, orange } from '../../colors';

import { TTheme } from './theme.types';

const lightTheme: TTheme = {
    type: 'light',
    elevationOpacity: 0.08,
    palette: {
        primary: {
            light: blue[400],
            main: blue[500],
            dark: blue[600],
        },
        secondary: {
            light: indigo[400],
            main: indigo[500],
            dark: indigo[600],
        },
        alert: {
            light: red[400],
            main: red[500],
            dark: red[600],
        },
        warning: {
            light: orange[300],
            main: orange[400],
            dark: orange[500],
        },
        success: {
            light: green[500],
            main: green[600],
            dark: green[700],
        },
        info: {
            light: indigo[100],
            main: indigo[200],
            dark: indigo[300],
        },
    },
    action: {
        hover: neutral[1250],
        hoverOpacity: 0.08,
        active: neutral[1250],
        activeOpacity: 0.16,
        focus: neutral[0],
        focusOpacity: 0.32,
        selected: blue[500],
        disabled: neutral[900],
    },
    text: {
        primary: neutral[1100],
        accent: neutral[900],
        secondary: neutral[800],
        disabled: neutral[500],
        contrast: neutral[0],
    },
    background: {
        default: neutral[50],
        shape: neutral[0],
    },
};

export default lightTheme;
