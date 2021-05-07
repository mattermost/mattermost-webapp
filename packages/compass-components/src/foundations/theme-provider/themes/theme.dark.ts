import { indigo, green, red, neutral, orange, purple, teal } from '../../colors';

import { TTheme } from './theme.types';

const themeDark: TTheme = {
    type: 'dark',
    elevationOpacity: 0.32,
    palette: {
        primary: {
            light: purple[300],
            main: purple[500],
            dark: purple[700],
        },
        secondary: {
            light: teal[300],
            main: teal[500],
            dark: teal[700],
        },
        alert: {
            light: red[300],
            main: red[500],
            dark: red[700],
        },
        warning: {
            light: orange[200],
            main: orange[400],
            dark: orange[600],
        },
        success: {
            light: green[400],
            main: green[600],
            dark: green[800],
        },
        info: {
            light: indigo[100],
            main: indigo[200],
            dark: indigo[300],
        },
    },
    action: {
        hover: neutral[0],
        hoverOpacity: 0.08,
        active: neutral[0],
        activeOpacity: 0.16,
        focus: neutral[1250],
        focusOpacity: 0.32,
        selected: purple[500],
        disabled: neutral[100],
    },
    text: {
        primary: neutral[50],
        accent: neutral[150],
        secondary: neutral[300],
        disabled: neutral[700],
        contrast: neutral[100],
    },
    background: {
        default: neutral[1100],
        shape: neutral[1000],
    },
};

export default themeDark;
