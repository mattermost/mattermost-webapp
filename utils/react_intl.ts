// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';

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

// This is still for the components that have not yet migrated to Typescript
export const intlConfigPropTypes = {
    locale: PropTypes.string,
    timeZone: PropTypes.string,
    formats: PropTypes.object,
    messages: PropTypes.object,
    textComponent: PropTypes.any,

    defaultLocale: PropTypes.string,
    defaultFormats: PropTypes.object,

    onError: PropTypes.func,
};

export const intlFormatPropTypes = {
    formatDate: PropTypes.func.isRequired,
    formatTime: PropTypes.func.isRequired,
    formatRelative: PropTypes.func.isRequired,
    formatNumber: PropTypes.func.isRequired,
    formatPlural: PropTypes.func.isRequired,
    formatMessage: PropTypes.func.isRequired,
    formatHTMLMessage: PropTypes.func.isRequired,
};

export const intlShape = PropTypes.shape({
    ...intlConfigPropTypes,
    ...intlFormatPropTypes,
    formatters: PropTypes.object,
    now: PropTypes.func.isRequired,
});
