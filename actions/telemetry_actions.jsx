// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import store from 'stores/redux_store.jsx';

import {isDevMode} from 'utils/utils';

const SUPPORTS_CLEAR_MARKS = isSupported([performance.clearMarks]);
const SUPPORTS_MARK = isSupported([performance.mark]);
const SUPPORTS_MEASURE_METHODS = isSupported([
    performance.measure,
    performance.getEntries,
    performance.getEntriesByName,
    performance.clearMeasures,
]);

export function isTelemetryEnabled(state) {
    const config = getConfig(state);
    return config.DiagnosticsEnabled === 'true';
}

export function shouldTrackPerformance(state = store.getState()) {
    return isDevMode(state) || isTelemetryEnabled(state);
}

export function trackEvent(category, event, props) {
    Client4.trackEvent(category, event, props);
    if (isDevMode() && category === 'performance' && props) {
        // eslint-disable-next-line no-console
        console.log(event + ' - ' + Object.entries(props).map(([key, value]) => `${key}: ${value}`).join(', '));
    }
}

export function pageVisited(category, name) {
    Client4.pageVisited(category, name);
}

/**
 * Takes an array of string names of performance markers and invokes
 * performance.clearMarkers on each.
 * @param   {array} names of markers to clear
 *
 */
export function clearMarks(names) {
    if (!shouldTrackPerformance() || !SUPPORTS_CLEAR_MARKS) {
        return;
    }
    names.forEach((name) => performance.clearMarks(name));
}

export function mark(name) {
    if (!shouldTrackPerformance() || !SUPPORTS_MARK) {
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
 * @returns {[number, number, string]} Either the measured duration (ms) and the string name
 * of the measure are returned or -1 and and empty string is returned if
 * in dev. mode or one of the marker can't be found.
 *
 */
export function measure(name1, name2) {
    if (!shouldTrackPerformance() || !SUPPORTS_MEASURE_METHODS) {
        return [-1, -1, ''];
    }

    // Check for existence of entry name to avoid DOMException
    const performanceEntries = performance.getEntries();
    if (![name1, name2].every((name) => performanceEntries.find((item) => item.name === name))) {
        return [-1, -1, ''];
    }

    const displayPrefix = '🐐 Mattermost: ';
    const measurementName = `${displayPrefix}${name1} - ${name2}`;
    performance.measure(measurementName, name1, name2);
    const {lastDuration, startTime} = mostRecentDurationByEntryName(measurementName);

    // Clean up the measures we created
    performance.clearMeasures(measurementName);
    return [lastDuration, startTime, measurementName];
}

/**
 * Measures the time and number of requests on first page load.
 */
export function measurePageLoadTelemetry() {
    if (!isSupported([
        performance,
        performance.timing.loadEventEnd,
        performance.timing.navigationStart,
        performance.getEntriesByType('resource'),
    ])) {
        return;
    }

    // Must be wrapped in setTimeout because loadEventEnd property is 0
    // until onload is complete, also time added because analytics
    // code isn't loaded until a subsequent window event has fired.
    const tenSeconds = 10000;
    setTimeout(() => {
        const {loadEventEnd, navigationStart} = window.performance.timing;
        const pageLoadTime = loadEventEnd - navigationStart;

        let numOfRequest = 0;
        let maxAPIResourceSize = 0; // in Bytes
        let longestAPIResource = '';
        let longestAPIResourceDuration = 0;
        performance.getEntriesByType('resource').forEach((resourceTimingEntry) => {
            if (resourceTimingEntry.initiatorType === 'xmlhttprequest' || resourceTimingEntry.initiatorType === 'fetch') {
                numOfRequest++;
                maxAPIResourceSize = Math.max(maxAPIResourceSize, resourceTimingEntry.encodedBodySize);

                if (resourceTimingEntry.responseEnd - resourceTimingEntry.startTime > longestAPIResourceDuration) {
                    longestAPIResourceDuration = resourceTimingEntry.responseEnd - resourceTimingEntry.startTime;
                    longestAPIResource = resourceTimingEntry.name?.split('/api/')?.[1] ?? '';
                }
            }
        });

        trackEvent('performance', 'page_load', {duration: pageLoadTime, numOfRequest, maxAPIResourceSize, longestAPIResource, longestAPIResourceDuration});
    }, tenSeconds);
}

/**
 * Measures the time and number of requests between channel or team switch start and the post list component rendering posts.
 * @param {Boolean} fresh set to true when the posts have not been loaded before
 */
export function measureChannelOrTeamSwitchTelemetry(fresh = false) {
    mark('PostList#component');

    const [channelSwitchDuration] = measure('SidebarChannelLink#click', 'PostList#component');
    const [teamSwitchDuration] = measure('TeamLink#click', 'PostList#component');

    clearMarks([
        'SidebarChannelLink#click',
        'TeamLink#click',
        'PostList#component',
    ]);

    // If channel was switched by clicking on sidebar channel link
    if (channelSwitchDuration !== -1) {
        trackEvent('performance', 'channel_switch', {duration: Math.round(channelSwitchDuration), fresh});
    }

    // If team was switched by clicking on team link
    if (teamSwitchDuration !== -1) {
        trackEvent('performance', 'team_switch', {duration: Math.round(teamSwitchDuration), fresh});
    }
}

function mostRecentDurationByEntryName(entryName) {
    const entriesWithName = performance.getEntriesByName(entryName);
    return entriesWithName.map((item) =>
        ({
            duration: item.duration,
            startTime: item.startTime,
        }))[entriesWithName.length - 1];
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
