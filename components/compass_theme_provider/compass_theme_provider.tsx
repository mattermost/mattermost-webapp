// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {blendColors, convertToRgb, rgbToHex, setAlpha} from '@mattermost/compass-components/shared/color-utils';
import React, {useState, useEffect} from 'react';
import {createGlobalStyle} from 'styled-components';

import ThemeProvider, {lightTheme} from '@mattermost/compass-components/utilities/theme';

import {Theme} from 'mattermost-redux/types/themes';
import Constants from '../../utils/constants';
import * as UserAgent from '../../utils/user_agent';

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
        // changeCss('code.hljs', 'visibility: hidden');

        const xmlHTTP = new XMLHttpRequest();

        xmlHTTP.open('GET', cssPath, true);
        xmlHTTP.onload = function onLoad() {
            link.href = cssPath;

            if (UserAgent.isFirefox()) {
                link.addEventListener('load', () => {
                    // changeCss('code.hljs', 'visibility: visible');
                }, {once: true});
            } else {
                // changeCss('code.hljs', 'visibility: visible');
            }
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

const CompassThemeProvider = ({theme, children}: Props): JSX.Element | null => {
    const [compassTheme, setCompassTheme] = useState({
        ...lightTheme,
        noStyleReset: true,
        noDefaultStyle: true,
        noFontFaces: true,
    });

    //     if (!UserAgent.isFirefox() && !UserAgent.isInternetExplorer() && !UserAgent.isEdge()) {
    //         changeCss('body.app__body ::-webkit-scrollbar-thumb', 'background:' + changeOpacity(theme.centerChannelColor, 0.4));
    //     }

    const CssVariables = createGlobalStyle`
        :root {
            // RGB values derived from theme hex values i.e. '255, 255, 255'
            // (do not apply opacity mutations here)
            --away-indicator-rgb: ${stripRGBDeclarator(convertToRgb(theme.awayIndicator))};
            --button-bg-rgb: ${stripRGBDeclarator(convertToRgb(theme.buttonBg))};
            --button-bg-hover-rgb: ${stripRGBDeclarator(convertToRgb(changeColor(theme.buttonBg, -0.15)))};
            --button-color-rgb: ${stripRGBDeclarator(convertToRgb(theme.buttonColor))};
            --center-channel-bg-rgb: ${stripRGBDeclarator(convertToRgb(theme.centerChannelBg))};
            --center-channel-color-rgb: ${stripRGBDeclarator(convertToRgb(theme.centerChannelColor))};
            --dnd-indicator-rgb: ${stripRGBDeclarator(convertToRgb(theme.dndIndicator))};
            --error-text-color-rgb: ${stripRGBDeclarator(convertToRgb(theme.errorTextColor))};
            --link-color-rgb: ${stripRGBDeclarator(convertToRgb(theme.linkColor))};
            --mention-bg-rgb: ${stripRGBDeclarator(convertToRgb(theme.mentionBg))};
            --mention-color-rgb: ${stripRGBDeclarator(convertToRgb(theme.mentionColor))};
            --mention-highlight-bg-rgb: ${stripRGBDeclarator(convertToRgb(theme.mentionHighlightBg))};
            --mention-highlight-link-rgb: ${stripRGBDeclarator(convertToRgb(theme.mentionHighlightLink))};
            --mention-highlight-bg-mixed-rgb: ${stripRGBADeclarator(dropAlpha(blendColors(theme.centerChannelBg, theme.mentionHighlightBg)))};
            --pinned-highlight-bg-mixed-rgb: ${stripRGBADeclarator(dropAlpha(blendColors(theme.centerChannelBg, theme.mentionHighlightBg)))};
            --own-highlight-bg-rgb: ${stripRGBADeclarator(dropAlpha(blendColors(theme.mentionHighlightBg, theme.centerChannelColor)))};
            --collapsed-post-bg-mixed-rgb: ${stripRGBADeclarator(dropAlpha(blendColors(theme.centerChannelBg, theme.centerChannelColor)))};
            --new-message-separator-rgb: ${stripRGBDeclarator(convertToRgb(theme.newMessageSeparator))};
            --online-indicator-rgb: ${stripRGBDeclarator(convertToRgb(theme.onlineIndicator))};
            --sidebar-bg-rgb: ${stripRGBDeclarator(convertToRgb(theme.sidebarBg))};
            --sidebar-header-bg-rgb: ${stripRGBDeclarator(convertToRgb(theme.sidebarHeaderBg))};
            --sidebar-teambar-bg-rgb: ${stripRGBDeclarator(convertToRgb(theme.sidebarTeamBarBg))};
            --sidebar-header-text-color-rgb: ${stripRGBDeclarator(convertToRgb(theme.sidebarHeaderTextColor))};
            --sidebar-text-rgb: ${stripRGBDeclarator(convertToRgb(theme.sidebarText))};
            --sidebar-text-active-border-rgb: ${stripRGBDeclarator(convertToRgb(theme.sidebarTextActiveBorder))};
            --sidebar-text-active-color-rgb: ${stripRGBDeclarator(convertToRgb(theme.sidebarTextActiveColor))};
            --sidebar-text-hover-bg-rgb: ${stripRGBDeclarator(convertToRgb(theme.sidebarTextHoverBg))};
            --sidebar-unread-text-rgb: ${stripRGBDeclarator(convertToRgb(theme.sidebarUnreadText))};

            // Hex CSS variables
            --sidebar-bg: ${theme.sidebarBg};
            --sidebar-text: ${theme.sidebarText};
            --sidebar-unread-text: ${theme.sidebarUnreadText};
            --sidebar-text-hover-bg: ${theme.sidebarTextHoverBg};
            --sidebar-text-active-border: ${theme.sidebarTextActiveBorder};
            --sidebar-text-active-color: ${theme.sidebarTextActiveColor};
            --sidebar-header-bg: ${theme.sidebarHeaderBg};
            --sidebar-teambar-bg: ${theme.sidebarTeamBarBg};
            --sidebar-header-text-color: ${theme.sidebarHeaderTextColor};
            --online-indicator: ${theme.onlineIndicator};
            --away-indicator: ${theme.awayIndicator};
            --dnd-indicator: ${theme.dndIndicator};
            --mention-bg: ${theme.mentionBg};
            --mention-color: ${theme.mentionColor};
            --center-channel-bg: ${theme.centerChannelBg};
            --center-channel-color: ${theme.centerChannelColor};
            --new-message-separator: ${theme.newMessageSeparator};
            --link-color: ${theme.linkColor};
            --button-bg: ${theme.buttonBg};
            --button-bg-hover: ${rgbToHex(changeColor(theme.buttonBg, -0.15))};
            --button-color: ${theme.buttonColor};
            --error-text: ${theme.errorTextColor};
            --mention-highlight-bg: ${theme.mentionHighlightBg};
            --mention-highlight-link: ${theme.mentionHighlightLink};

            // Legacy variables with baked in opacity, do not use!
            --sidebar-text-08: ${setAlpha(theme.sidebarText, 0.08)};
            --sidebar-text-16: ${setAlpha(theme.sidebarText, 0.16)};
            --sidebar-text-30: ${setAlpha(theme.sidebarText, 0.3)};
            --sidebar-text-40: ${setAlpha(theme.sidebarText, 0.4)};
            --sidebar-text-50: ${setAlpha(theme.sidebarText, 0.5)};
            --sidebar-text-60: ${setAlpha(theme.sidebarText, 0.6)};
            --sidebar-text-72: ${setAlpha(theme.sidebarText, 0.72)};
            --sidebar-text-80: ${setAlpha(theme.sidebarText, 0.8)};
            --sidebar-header-text-color-80: ${setAlpha(theme.sidebarHeaderTextColor, 0.8)};
            --center-channel-bg-88: ${setAlpha(theme.centerChannelBg, 0.88)};
            --center-channel-color-88: ${setAlpha(theme.centerChannelColor, 0.88)};
            --center-channel-bg-80: ${setAlpha(theme.centerChannelBg, 0.8)};
            --center-channel-color-80: ${setAlpha(theme.centerChannelColor, 0.8)};
            --center-channel-color-72: ${setAlpha(theme.centerChannelColor, 0.72)};
            --center-channel-bg-64: ${setAlpha(theme.centerChannelBg, 0.64)};
            --center-channel-color-64: ${setAlpha(theme.centerChannelColor, 0.64)};
            --center-channel-bg-56: ${setAlpha(theme.centerChannelBg, 0.56)};
            --center-channel-color-56: ${setAlpha(theme.centerChannelColor, 0.56)};
            --center-channel-color-48: ${setAlpha(theme.centerChannelColor, 0.48)};
            --center-channel-bg-40: ${setAlpha(theme.centerChannelBg, 0.4)};
            --center-channel-color-40: ${setAlpha(theme.centerChannelColor, 0.4)};
            --center-channel-bg-30: ${setAlpha(theme.centerChannelBg, 0.3)};
            --center-channel-color-32: ${setAlpha(theme.centerChannelColor, 0.32)};
            --center-channel-bg-20: ${setAlpha(theme.centerChannelBg, 0.2)};
            --center-channel-color-20: ${setAlpha(theme.centerChannelColor, 0.2)};
            --center-channel-bg-16: ${setAlpha(theme.centerChannelBg, 0.16)};
            --center-channel-color-24: ${setAlpha(theme.centerChannelColor, 0.24)};
            --center-channel-color-16: ${setAlpha(theme.centerChannelColor, 0.16)};
            --center-channel-bg-08: ${setAlpha(theme.centerChannelBg, 0.08)};
            --center-channel-color-08: ${setAlpha(theme.centerChannelColor, 0.08)};
            --center-channel-color-04: ${setAlpha(theme.centerChannelColor, 0.04)};
            --link-color-08: ${setAlpha(theme.linkColor, 0.08)};
            --button-bg-88: ${setAlpha(theme.buttonBg, 0.88)};
            --button-color-88: ${setAlpha(theme.buttonColor, 0.88)};
            --button-bg-80: ${setAlpha(theme.buttonBg, 0.8)};
            --button-color-80: ${setAlpha(theme.buttonColor, 0.8)};
            --button-bg-72: ${setAlpha(theme.buttonBg, 0.72)};
            --button-color-72: ${setAlpha(theme.buttonColor, 0.72)};
            --button-bg-64: ${setAlpha(theme.buttonBg, 0.64)};
            --button-color-64: ${setAlpha(theme.buttonColor, 0.64)};
            --button-bg-56: ${setAlpha(theme.buttonBg, 0.56)};
            --button-color-56: ${setAlpha(theme.buttonColor, 0.56)};
            --button-bg-48: ${setAlpha(theme.buttonBg, 0.48)};
            --button-color-48: ${setAlpha(theme.buttonColor, 0.48)};
            --button-bg-40: ${setAlpha(theme.buttonBg, 0.4)};
            --button-color-40: ${setAlpha(theme.buttonColor, 0.4)};
            --button-bg-30: ${setAlpha(theme.buttonBg, 0.32)};
            --button-color-32: ${setAlpha(theme.buttonColor, 0.32)};
            --button-bg-24: ${setAlpha(theme.buttonBg, 0.24)};
            --button-color-24: ${setAlpha(theme.buttonColor, 0.24)};
            --button-bg-16: ${setAlpha(theme.buttonBg, 0.16)};
            --button-color-16: ${setAlpha(theme.buttonColor, 0.16)};
            --button-bg-08: ${setAlpha(theme.buttonBg, 0.08)};
            --button-color-08: ${setAlpha(theme.buttonColor, 0.08)};
            --button-bg-04: ${setAlpha(theme.buttonBg, 0.04)};
            --button-color-04: ${setAlpha(theme.buttonColor, 0.04)};
            --error-text-08: ${setAlpha(theme.errorTextColor, 0.08)};
            --error-text-12: ${setAlpha(theme.errorTextColor, 0.12)};
        }
    `;

    useEffect(() => {
        updateCodeTheme(theme.codeTheme);
    }, [theme.codeTheme]);

    useEffect(() => {
        setCompassTheme({
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
        });
    }, [theme]);

    return (
        <ThemeProvider theme={compassTheme}>
            <CssVariables/>
            {children}
        </ThemeProvider>
    );
};

export default CompassThemeProvider;
