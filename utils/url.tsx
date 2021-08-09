// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {latinise} from 'utils/latinise';
import {t} from 'utils/i18n';
import * as TextFormatting from 'utils/text_formatting';

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

export function getBasePathFromWindowObject(obj: WindowObject): string {
    return obj.basename || '';
}

export function getBasePath(): string {
    return getBasePathFromWindowObject(window);
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

function formattedError(id: string, message: string): React.ReactElement {
    return (<span key={id}>
        <FormattedMessage
            id={id}
            defaultMessage={message}
        />
        <br/>
    </span>);
}

export function validateChannelUrl(url: string): React.ReactElement[] {
    const errors: React.ReactElement[] = [];

    const USER_ID_LENGTH = 26;
    const directMessageRegex = new RegExp(`^.{${USER_ID_LENGTH}}__.{${USER_ID_LENGTH}}$`);
    const isDirectMessageFormat = directMessageRegex.test(url);

    const cleanedURL = cleanUpUrlable(url);
    const urlMatched = url.match(/[a-z0-9]([-_\w]*)[a-z0-9]/);
    if (cleanedURL !== url || !urlMatched || urlMatched[0] !== url || isDirectMessageFormat) {
        if (url.length < 2) {
            errors.push(formattedError(t('change_url.longer'), 'URLs must have at least 2 characters.'));
        }

        if (isDirectMessageFormat) {
            errors.push(formattedError(t('change_url.invalidDirectMessage'), 'User IDs are not allowed in channel URLs.'));
        }

        const startsWithoutLetter = url.charAt(0) === '-' || url.charAt(0) === '_';
        const endsWithoutLetter = url.length > 1 && (url.charAt(url.length - 1) === '-' || url.charAt(url.length - 1) === '_');
        if (startsWithoutLetter && endsWithoutLetter) {
            errors.push(formattedError(t('change_url.startAndEndWithLetter'), 'URLs must start and end with a lowercase letter or number.'));
        } else if (startsWithoutLetter) {
            errors.push(formattedError(t('change_url.startWithLetter'), 'URLs must start with a lowercase letter or number.'));
        } else if (endsWithoutLetter) {
            errors.push(formattedError(t('change_url.endWithLetter'), 'URLs must end with a lowercase letter or number.'));
        }

        // In case of error we don't detect
        if (errors.length === 0) {
            errors.push(formattedError(t('change_url.invalidUrl'), 'Invalid URL'));
        }
    }

    return errors;
}

export function isInternalURL(url: string, siteURL?: string): boolean {
    return url.startsWith(siteURL || '') || url.startsWith('/');
}

export function shouldOpenInNewTab(url: string, siteURL?: string, managedResourcePaths?: string[]): boolean {
    if (!isInternalURL(url, siteURL)) {
        return true;
    }

    const path = url.startsWith('/') ? url : url.substring(siteURL?.length || 0);

    // Paths managed by plugins and public file links aren't handled by the web app
    const unhandledPaths = [
        'plugins',
        'files',
    ];

    // Paths managed by another service shouldn't be handled by the web app either
    if (managedResourcePaths) {
        for (const managedPath of managedResourcePaths) {
            unhandledPaths.push(TextFormatting.escapeRegex(managedPath));
        }
    }

    return unhandledPaths.some((unhandledPath) => new RegExp('^/' + unhandledPath + '\\b').test(path));
}
