// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type LegacyThemeKeys = 'default' | 'organization' | 'mattermostDark' | 'windows10';

export type ActiveThemeKeys = 'sapphire' | 'quartz' | 'indigo' | 'onyx';

export type ThemeKeys = LegacyThemeKeys | ActiveThemeKeys;

export type LegacyThemeTypes = 'Mattermost' | 'Organization' | 'Mattermost Dark' | 'Windows Dark';

export type ActiveThemeTypes = 'Sapphire' | 'Quartz' | 'Indigo' | 'Onyx';

export type ThemeTypes = LegacyThemeTypes | ActiveThemeTypes;

export type Theme = {
    [key: string]: string | undefined;
    type?: ActiveThemeTypes | 'custom';
    sidebarBg: string;
    sidebarText: string;
    sidebarUnreadText: string;
    sidebarTextHoverBg: string;
    sidebarTextActiveBorder: string;
    sidebarTextActiveColor: string;
    sidebarHeaderBg: string;
    sidebarTeamBarBg: string;
    sidebarHeaderTextColor: string;
    onlineIndicator: string;
    awayIndicator: string;
    dndIndicator: string;
    mentionBg: string;
    mentionBj: string;
    mentionColor: string;
    centerChannelBg: string;
    centerChannelColor: string;
    newMessageSeparator: string;
    linkColor: string;
    buttonBg: string;
    buttonColor: string;
    errorTextColor: string;
    mentionHighlightBg: string;
    mentionHighlightLink: string;
    codeTheme: string;
};

export type ThemeTypeMap = Record<ThemeTypes, ActiveThemeKeys>;
