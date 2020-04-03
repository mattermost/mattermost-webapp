// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {latinise} from 'utils/latinise';

type WindowObject = {
    location: {
        origin: string;
        protocol: string;
        hostname: string;
        port: string;
    };
    basename?: string;
}

export function cleanUpUrlable(input: string): string {
    let cleaned: string = latinise(input);
    cleaned = cleaned.trim().replace(/-/g, ' ').replace(/[^\w\s]/gi, '').toLowerCase().replace(/\s/g, '-');
    cleaned = cleaned.replace(/^-+/, '');
    cleaned = cleaned.replace(/-+$/, '');
    return cleaned;
}

export function getShortenedURL(url = '', getLength = 27): string {
    if (url.length > 35) {
        const subLength = getLength - 14;
        return url.substring(0, 10) + '...' + url.substring(url.length - subLength, url.length) + '/';
    }
    return url + '/';
}

export function getSiteURLFromWindowObject(obj: WindowObject): string {
    let siteURL = '';
    if (obj.location.origin) {
        siteURL = obj.location.origin;
    } else {
        siteURL = obj.location.protocol + '//' + obj.location.hostname + (obj.location.port ? ':' + obj.location.port : '');
    }

    if (siteURL[siteURL.length - 1] === '/') {
        siteURL = siteURL.substring(0, siteURL.length - 1);
    }

    if (obj.basename) {
        siteURL += obj.basename;
    }

    if (siteURL[siteURL.length - 1] === '/') {
        siteURL = siteURL.substring(0, siteURL.length - 1);
    }

    return siteURL;
}

export function getSiteURL(): string {
    return getSiteURLFromWindowObject(window);
}

export function getRelativeChannelURL(teamName: string, channelName: string): string {
    return `/${teamName}/channels/${channelName}`;
}

export function isUrlSafe(url: string): boolean {
    let unescaped: string;

    try {
        unescaped = decodeURIComponent(url);
    } catch (e) {
        unescaped = unescape(url);
    }

    unescaped = unescaped.replace(/[^\w:]/g, '').toLowerCase();

    return !unescaped.startsWith('javascript:') && // eslint-disable-line no-script-url
        !unescaped.startsWith('vbscript:') &&
        !unescaped.startsWith('data:');
}

export function useSafeUrl(url: string, defaultUrl = ''): string {
    if (isUrlSafe(url)) {
        return url;
    }

    return defaultUrl;
}

export function getScheme(url: string): string | null {
    const match = (/([a-z0-9+.-]+):/i).exec(url);

    return match && match[1];
}

type ErrorMessage = {
    id: string;
    defaultMessage: string;
}
export function validateChannelUrl(url: string): ErrorMessage[] {
    const errors: ErrorMessage[] = [];

    const cleanedURL = cleanUpUrlable(url);
    const urlMatched = url.match(/[a-z0-9]([-_\w]*)[a-z0-9]/);
    if (cleanedURL !== url || !urlMatched || urlMatched[0] !== url || url.indexOf('__') > -1) {
        if (url.length < 2) {
            errors.push({id: 'change_url.longer', defaultMessage: 'URL must be two or more characters.'});
        }
        if (url.charAt(0) === '-' || url.charAt(0) === '_') {
            errors.push({id: 'change_url.startWithLetter', defaultMessage: 'URL must start with a letter or number.'});
        }
        if (url.length > 1 && (url.charAt(url.length - 1) === '-' || url.charAt(url.length - 1) === '_')) {
            errors.push({id: 'change_url.endWithLetter', defaultMessage: 'URL must end with a letter or number.'});
        }
        if (url.indexOf('__') > -1) {
            errors.push({id: 'change_url.noUnderscore', defaultMessage: 'URL can not contain two underscores in a row.'});
        }

        // In case of error we don't detect
        if (errors.length === 0) {
            errors.push({id: 'change_url.invalidUrl', defaultMessage: 'Invalid URL'});
        }
    }

    return errors;
}
