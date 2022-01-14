// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {blendColors, convertToRgb, rgbToHex, setAlpha} from '@mattermost/compass-components/shared/color-utils';
import React, {useState, useEffect} from 'react';
import {createGlobalStyle} from 'styled-components';

import ThemeProvider, {lightTheme} from '@mattermost/compass-components/utilities/theme';

import {Theme} from 'mattermost-redux/types/themes';
import Constants from '../../utils/constants';

const updateCodeTheme = (userTheme: string): void => {
    let cssPath = '';
    Constants.THEME_ELEMENTS.forEach((element) => {
        if (element.id === 'codeTheme') {
            element.themes?.forEach((theme) => {
                if (userTheme === theme.id) {
                    cssPath = theme.cssURL;
                }
            });
        }
    });

    const link = document.querySelector<HTMLLinkElement>('link.code_theme');
    if (link && cssPath !== link.href) {
        const xmlHTTP = new XMLHttpRequest();

        xmlHTTP.open('GET', cssPath, true);
        xmlHTTP.onload = function onLoad() {
            link.href = cssPath;
        };

        xmlHTTP.send();
    }
};

const changeColor = (colourIn: string, amt: number) => {
    let hex = colourIn;
    let lum = amt;

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    let rgb = '#';
    let c;
    let i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ('00' + c).substr(c.length);
    }

    return rgb;
};

const stripRGBDeclarator = (color: string) => color.slice(4, -1);
const stripRGBADeclarator = (color: string) => color.slice(5, -4);
const dropAlpha = (color: string) => setAlpha(color, 1);

type Props = {
    theme: Theme;
    children?: React.ReactNode;
}

type CSSVariableProps = {
    oldTheme: Theme;
}

const CssVariables = createGlobalStyle<CSSVariableProps>`
    :root {
        // Hex CSS variables
        --sidebar-bg: ${({oldTheme}) => oldTheme.sidebarBg};
        --sidebar-text: ${({oldTheme}) => oldTheme.sidebarText};
        --sidebar-unread-text: ${({oldTheme}) => oldTheme.sidebarUnreadText};
        --sidebar-text-hover-bg: ${({oldTheme}) => oldTheme.sidebarTextHoverBg};
        --sidebar-text-active-border-test: ${({oldTheme}) => `rgb(${oldTheme.sidebarTextActiveBorder})`};
        --sidebar-text-active-color: ${({oldTheme}) => oldTheme.sidebarTextActiveColor};
        --sidebar-header-bg: ${({oldTheme}) => oldTheme.sidebarHeaderBg};
        --sidebar-teambar-bg: ${({oldTheme}) => oldTheme.sidebarTeamBarBg};
        --sidebar-header-text-color: ${({oldTheme}) => oldTheme.sidebarHeaderTextColor};
        --online-indicator: ${({oldTheme}) => oldTheme.onlineIndicator};
        --away-indicator: ${({oldTheme}) => oldTheme.awayIndicator};
        --dnd-indicator: ${({oldTheme}) => oldTheme.dndIndicator};
        --mention-bg: ${({oldTheme}) => oldTheme.mentionBg};
        --mention-color: ${({oldTheme}) => oldTheme.mentionColor};
        --center-channel-bg: ${({oldTheme}) => oldTheme.centerChannelBg};
        --center-channel-color: ${({oldTheme}) => oldTheme.centerChannelColor};
        --new-message-separator: ${({oldTheme}) => oldTheme.newMessageSeparator};
        --link-color: ${({oldTheme}) => oldTheme.linkColor};
        --button-bg: ${({oldTheme}) => oldTheme.buttonBg};
        --button-bg-hover: ${({oldTheme}) => rgbToHex(changeColor(oldTheme.buttonBg, -0.15))};
        --button-color: ${({oldTheme}) => oldTheme.buttonColor};
        --error-text: ${({oldTheme}) => oldTheme.errorTextColor};
        --mention-highlight-bg: ${({oldTheme}) => oldTheme.mentionHighlightBg};
        --mention-highlight-link: ${({oldTheme}) => oldTheme.mentionHighlightLink};

        // RGB values derived from theme hex values i.e. '255, 255, 255'
        // (do not apply opacity mutations here)
        --away-indicator-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.awayIndicator))};
        --button-bg-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.buttonBg))};
        --button-bg-hover-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(changeColor(oldTheme.buttonBg, -0.15)))};
        --button-color-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.buttonColor))};
        --center-channel-bg-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.centerChannelBg))};
        --center-channel-color-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.centerChannelColor))};
        --dnd-indicator-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.dndIndicator))};
        --error-text-color-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.errorTextColor))};
        --link-color-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.linkColor))};
        --mention-bg-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.mentionBg))};
        --mention-color-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.mentionColor))};
        --mention-highlight-bg-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.mentionHighlightBg))};
        --mention-highlight-link-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.mentionHighlightLink))};
        --mention-highlight-bg-mixed-rgb: ${({oldTheme}) => stripRGBADeclarator(dropAlpha(blendColors(oldTheme.centerChannelBg, oldTheme.mentionHighlightBg)))};
        --pinned-highlight-bg-mixed-rgb: ${({oldTheme}) => stripRGBADeclarator(dropAlpha(blendColors(oldTheme.centerChannelBg, oldTheme.mentionHighlightBg)))};
        --own-highlight-bg-rgb: ${({oldTheme}) => stripRGBADeclarator(dropAlpha(blendColors(oldTheme.mentionHighlightBg, oldTheme.centerChannelColor)))};
        --collapsed-post-bg-mixed-rgb: ${({oldTheme}) => stripRGBADeclarator(dropAlpha(blendColors(oldTheme.centerChannelBg, oldTheme.centerChannelColor)))};
        --new-message-separator-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.newMessageSeparator))};
        --online-indicator-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.onlineIndicator))};
        --sidebar-bg-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.sidebarBg))};
        --sidebar-header-bg-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.sidebarHeaderBg))};
        --sidebar-teambar-bg-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.sidebarTeamBarBg))};
        --sidebar-header-text-color-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.sidebarHeaderTextColor))};
        --sidebar-text-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.sidebarText))};
        --sidebar-text-active-border-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.sidebarTextActiveBorder))};
        --sidebar-text-active-color-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.sidebarTextActiveColor))};
        --sidebar-text-hover-bg-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.sidebarTextHoverBg))};
        --sidebar-unread-text-rgb: ${({oldTheme}) => stripRGBDeclarator(convertToRgb(oldTheme.sidebarUnreadText))};

        // Legacy variables with baked in opacity, do not use!
        --sidebar-text-08: ${({oldTheme}) => setAlpha(oldTheme.sidebarText, 0.08)};
        --sidebar-text-16: ${({oldTheme}) => setAlpha(oldTheme.sidebarText, 0.16)};
        --sidebar-text-30: ${({oldTheme}) => setAlpha(oldTheme.sidebarText, 0.3)};
        --sidebar-text-40: ${({oldTheme}) => setAlpha(oldTheme.sidebarText, 0.4)};
        --sidebar-text-50: ${({oldTheme}) => setAlpha(oldTheme.sidebarText, 0.5)};
        --sidebar-text-60: ${({oldTheme}) => setAlpha(oldTheme.sidebarText, 0.6)};
        --sidebar-text-72: ${({oldTheme}) => setAlpha(oldTheme.sidebarText, 0.72)};
        --sidebar-text-80: ${({oldTheme}) => setAlpha(oldTheme.sidebarText, 0.8)};
        --sidebar-header-text-color-80: ${({oldTheme}) => setAlpha(oldTheme.sidebarHeaderTextColor, 0.8)};
        --center-channel-bg-88: ${({oldTheme}) => setAlpha(oldTheme.centerChannelBg, 0.88)};
        --center-channel-color-88: ${({oldTheme}) => setAlpha(oldTheme.centerChannelColor, 0.88)};
        --center-channel-bg-80: ${({oldTheme}) => setAlpha(oldTheme.centerChannelBg, 0.8)};
        --center-channel-color-80: ${({oldTheme}) => setAlpha(oldTheme.centerChannelColor, 0.8)};
        --center-channel-color-72: ${({oldTheme}) => setAlpha(oldTheme.centerChannelColor, 0.72)};
        --center-channel-bg-64: ${({oldTheme}) => setAlpha(oldTheme.centerChannelBg, 0.64)};
        --center-channel-color-64: ${({oldTheme}) => setAlpha(oldTheme.centerChannelColor, 0.64)};
        --center-channel-bg-56: ${({oldTheme}) => setAlpha(oldTheme.centerChannelBg, 0.56)};
        --center-channel-color-56: ${({oldTheme}) => setAlpha(oldTheme.centerChannelColor, 0.56)};
        --center-channel-color-48: ${({oldTheme}) => setAlpha(oldTheme.centerChannelColor, 0.48)};
        --center-channel-bg-40: ${({oldTheme}) => setAlpha(oldTheme.centerChannelBg, 0.4)};
        --center-channel-color-40: ${({oldTheme}) => setAlpha(oldTheme.centerChannelColor, 0.4)};
        --center-channel-bg-30: ${({oldTheme}) => setAlpha(oldTheme.centerChannelBg, 0.3)};
        --center-channel-color-32: ${({oldTheme}) => setAlpha(oldTheme.centerChannelColor, 0.32)};
        --center-channel-bg-20: ${({oldTheme}) => setAlpha(oldTheme.centerChannelBg, 0.2)};
        --center-channel-color-20: ${({oldTheme}) => setAlpha(oldTheme.centerChannelColor, 0.2)};
        --center-channel-bg-16: ${({oldTheme}) => setAlpha(oldTheme.centerChannelBg, 0.16)};
        --center-channel-color-24: ${({oldTheme}) => setAlpha(oldTheme.centerChannelColor, 0.24)};
        --center-channel-color-16: ${({oldTheme}) => setAlpha(oldTheme.centerChannelColor, 0.16)};
        --center-channel-bg-08: ${({oldTheme}) => setAlpha(oldTheme.centerChannelBg, 0.08)};
        --center-channel-color-08: ${({oldTheme}) => setAlpha(oldTheme.centerChannelColor, 0.08)};
        --center-channel-color-04: ${({oldTheme}) => setAlpha(oldTheme.centerChannelColor, 0.04)};
        --link-color-08: ${({oldTheme}) => setAlpha(oldTheme.linkColor, 0.08)};
        --button-bg-88: ${({oldTheme}) => setAlpha(oldTheme.buttonBg, 0.88)};
        --button-color-88: ${({oldTheme}) => setAlpha(oldTheme.buttonColor, 0.88)};
        --button-bg-80: ${({oldTheme}) => setAlpha(oldTheme.buttonBg, 0.8)};
        --button-color-80: ${({oldTheme}) => setAlpha(oldTheme.buttonColor, 0.8)};
        --button-bg-72: ${({oldTheme}) => setAlpha(oldTheme.buttonBg, 0.72)};
        --button-color-72: ${({oldTheme}) => setAlpha(oldTheme.buttonColor, 0.72)};
        --button-bg-64: ${({oldTheme}) => setAlpha(oldTheme.buttonBg, 0.64)};
        --button-color-64: ${({oldTheme}) => setAlpha(oldTheme.buttonColor, 0.64)};
        --button-bg-56: ${({oldTheme}) => setAlpha(oldTheme.buttonBg, 0.56)};
        --button-color-56: ${({oldTheme}) => setAlpha(oldTheme.buttonColor, 0.56)};
        --button-bg-48: ${({oldTheme}) => setAlpha(oldTheme.buttonBg, 0.48)};
        --button-color-48: ${({oldTheme}) => setAlpha(oldTheme.buttonColor, 0.48)};
        --button-bg-40: ${({oldTheme}) => setAlpha(oldTheme.buttonBg, 0.4)};
        --button-color-40: ${({oldTheme}) => setAlpha(oldTheme.buttonColor, 0.4)};
        --button-bg-30: ${({oldTheme}) => setAlpha(oldTheme.buttonBg, 0.32)};
        --button-color-32: ${({oldTheme}) => setAlpha(oldTheme.buttonColor, 0.32)};
        --button-bg-24: ${({oldTheme}) => setAlpha(oldTheme.buttonBg, 0.24)};
        --button-color-24: ${({oldTheme}) => setAlpha(oldTheme.buttonColor, 0.24)};
        --button-bg-16: ${({oldTheme}) => setAlpha(oldTheme.buttonBg, 0.16)};
        --button-color-16: ${({oldTheme}) => setAlpha(oldTheme.buttonColor, 0.16)};
        --button-bg-08: ${({oldTheme}) => setAlpha(oldTheme.buttonBg, 0.08)};
        --button-color-08: ${({oldTheme}) => setAlpha(oldTheme.buttonColor, 0.08)};
        --button-bg-04: ${({oldTheme}) => setAlpha(oldTheme.buttonBg, 0.04)};
        --button-color-04: ${({oldTheme}) => setAlpha(oldTheme.buttonColor, 0.04)};
        --error-text-08: ${({oldTheme}) => setAlpha(oldTheme.errorTextColor, 0.08)};
        --error-text-12: ${({oldTheme}) => setAlpha(oldTheme.errorTextColor, 0.12)};
    }
`;

const CompassThemeProvider = ({theme, children}: Props): JSX.Element | null => {
    const [compassTheme, setCompassTheme] = useState({
        ...lightTheme,
        noStyleReset: true,
        noDefaultStyle: true,
        noFontFaces: true,
    });

    useEffect(() => {
        updateCodeTheme(theme.codeTheme);
    }, [theme.codeTheme]);

    useEffect(() => {
        const newCompassTheme = {
            ...compassTheme,
            palette: {
                ...compassTheme.palette,
                primary: {
                    ...compassTheme.palette.primary,
                    main: theme.sidebarHeaderBg,
                    contrast: theme.sidebarHeaderTextColor,
                },
                alert: {
                    ...compassTheme.palette.alert,
                    main: theme.dndIndicator,
                },
            },
            action: {
                ...compassTheme.action,
                hover: theme.sidebarHeaderTextColor,
                disabled: theme.sidebarHeaderTextColor,
            },
            badges: {
                ...compassTheme.badges,
                online: theme.onlineIndicator,
                away: theme.awayIndicator,
                dnd: theme.dndIndicator,
            },
            text: {
                ...compassTheme.text,
                primary: theme.sidebarHeaderTextColor,
            },
        };

        setCompassTheme(newCompassTheme);

        window.theme = theme || {};
        window.compassTheme = newCompassTheme || {};
    }, [theme]);

    return (
        <ThemeProvider theme={compassTheme}>
            <CssVariables oldTheme={theme}/>
            {children}
        </ThemeProvider>
    );
};

export default CompassThemeProvider;
