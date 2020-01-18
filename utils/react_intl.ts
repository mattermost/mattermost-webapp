// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export interface IntlConfigPropTypes {
    locale: string;
    timeZone: string;
    formats: object;
    messages: object;
    textComponent: (...args: any[]) => any;

    defaultLocale: string;
    defaultFormats: object;

    onError: (...args: any[]) => any;
}

export interface IntlFormatPropTypes {
    formatDate: (...args: any[]) => any;
    formatTime: (...args: any[]) => any;
    formatRelative: (...args: any[]) => any;
    formatNumber: (...args: any[]) => any;
    formatPlural: (...args: any[]) => any;
    formatMessage: (...args: any[]) => any;
    formatHTMLMessage: (...args: any[]) => any;
}

export interface IntlShape extends IntlConfigPropTypes, IntlFormatPropTypes {
    formatters: object;
    now: (...args: any[]) => any;
}
