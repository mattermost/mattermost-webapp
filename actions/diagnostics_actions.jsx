// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import store from 'stores/redux_store.jsx';
import UserStore from 'stores/user_store.jsx';

const SUPPORTS_CLEAR_MARKS = isSupported([performance.clearMarks]);
const SUPPORTS_MARK = isSupported([performance.mark]);
const SUPPORTS_MEASURE_METHODS = isSupported([
    performance.measure,
    performance.getEntries,
    performance.getEntriesByName,
    performance.clearMeasures,
]);

export function trackEvent(category, event, props) {
    if (global.window && global.window.analytics) {
        const properties = Object.assign({category, type: event, user_actual_id: UserStore.getCurrentId()}, props);
        const options = {
            context: {
                ip: '0.0.0.0',
            },
            page: {
                path: '',
                referrer: '',
                search: '',
                title: '',
                url: '',
            },
            anonymousId: '00000000000000000000000000',
        };
        global.window.analytics.track('event', properties, options);
    }
}

/**
 * Takes an array of string names of performance markers and invokes
 * performance.clearMarkers on each.
 * @param   {array} names of markers to clear
 *
 */
export function clearMarks(names) {
    if (!isDevMode() || !SUPPORTS_CLEAR_MARKS) {
        return;
    }
    names.forEach((name) => performance.clearMarks(name));
}

export function mark(name) {
    if (!isDevMode() || !SUPPORTS_MARK) {
        return;
    }
    performance.mark(name);
}

/**
 * Takes the names of two markers and invokes performance.measure on
 * them. The measured duration (ms) and the string name of the measure is
 * are returned.
 *
 * @param   {string} name1 the first marker
 * @param   {string} name2 the second marker
 *
 * @returns {[number, string]} Either the measured duration (ms) and the string name
 * of the measure are returned or -1 and and empty string is returned if
 * in dev. mode or one of the marker can't be found.
 *
 */
export function measure(name1, name2) {
    if (!isDevMode() || !SUPPORTS_MEASURE_METHODS) {
        return [-1, ''];
    }

    // Check for existence of entry name to avoid DOMException
    const performanceEntries = performance.getEntries();
    if (![name1, name2].every((name) => performanceEntries.find((item) => item.name === name))) {
        return [-1, ''];
    }

    const displayPrefix = '🐐 Mattermost: ';
    const measurementName = `${displayPrefix}${name1} - ${name2}`;
    performance.measure(measurementName, name1, name2);
    const lastDuration = mostRecentDurationByEntryName(measurementName);

    // Clean up the measures we created
    performance.clearMeasures(measurementName);
    return [lastDuration, measurementName];
}

export function trackLoadTime() {
    if (!isSupported([performance.timing.loadEventEnd, performance.timing.navigationStart])) {
        return;
    }

    // Must be wrapped in setTimeout because loadEventEnd property is 0
    // until onload is complete, also time added because analytics
    // code isn't loaded until a subsequent window event has fired.
    const tenSeconds = 10000;
    setTimeout(() => {
        const {loadEventEnd, navigationStart} = window.performance.timing;
        const pageLoadTime = loadEventEnd - navigationStart;
        trackEvent('performance', 'page_load', {duration: pageLoadTime});
    }, tenSeconds);
}

function mostRecentDurationByEntryName(entryName) {
    const entriesWithName = performance.getEntriesByName(entryName);
    return entriesWithName.map((item) => item.duration)[entriesWithName.length - 1];
}

function isSupported(checks) {
    for (let i = 0, len = checks.length; i < len; i++) {
        const item = checks[i];
        if (typeof item === 'undefined') {
            return false;
        }
    }
    return true;
}

function isDevMode() {
    const config = getConfig(store.getState());

    return config.EnableDeveloper === 'true';
}
