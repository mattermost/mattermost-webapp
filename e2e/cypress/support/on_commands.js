// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const PLATFORMS = {
    linux: 'linux',
    mac: 'darwin',
    windows: 'win32',
};

const BROWSERS = {
    chrome: 'chrome',
    electron: 'electron',
    firefox: 'firefox',
};

// const isPlatform = (name) => ['win32', 'darwin', 'linux'].includes(name);
// const isBrowser = (name) => ['electron', 'chrome', 'firefox'].includes(name);
// const isHeadedName = (name) => ['headed', 'headless'].includes(name);

const getMochaContext = () => cy.state('runnable').ctx;
const skip = () => {
    const ctx = getMochaContext();
    return ctx.skip();
};

function isPlatform(options = {}) {
    console.log('isPlatform options:', options);
    for (const platform of options.platforms.split(',')) {
        if (PLATFORMS[platform] && PLATFORMS[platform] === Cypress.platform) {
            console.log('isPlatform true');
            return true;
        }
    }
    console.log('isPlatform false');
    return false;
}

function isBrowser(options = {}) {
    for (const browser of options.browsers.split(',')) {
        if (BROWSERS[browser] && Cypress.isBrowser(BROWSERS[browser])) {
            console.log('isBrowser true');
            return true;
        }
    }
    console.log('isBrowser false');
    return false;
}

function isHeadless(options = {}) {
    if ((options.headless && Cypress.browser.isHeadless) ||
        (!options.headless && Cypress.browser.isHeaded)
    ) {
        console.log('isHeadless true');
        return true;
    }
    console.log('isHeadless false');
    return false;
}

function isTags(options = {}) {
    for (const tag of options.tags.split(',')) {
        if (process.env.TAGS && process.env.TAGS.includes(tag)) {
            console.log('isTags true');
            return true;
        }
    }
    console.log('isTags false');
    return false;
}

/**
 * Login a user directly via API
 * @param {Object} options
 *   {String} platforms - comma separated platforms, e.g. "mac,windows,linux"
 *   {String} browsers - comma separated browsers, e.g. "chrome,electron,firefox"
 *   {Boolean} headless - "true" as headless and "false" as headed
 */
export function skipOn(options = {}) {
    console.log('options.hasOwnProperty(platforms):', options.hasOwnProperty('platforms'));
    console.log('options.hasOwnProperty(browsers):', options.hasOwnProperty('browsers'));
    console.log('options.hasOwnProperty(headless):', options.hasOwnProperty('headless'));
    console.log('options.hasOwnProperty(tags):', options.hasOwnProperty('tags'));

    if ((options.hasOwnProperty('platforms') && isPlatform(options)) ||
        (options.hasOwnProperty('browsers') && isBrowser(options)) ||
        (options.hasOwnProperty('headless') && isHeadless(options)) ||
        (options.hasOwnProperty('tags') && isTags(options))
    ) {
        console.log('---> SKIP');
        skip();
    }
}

export function runOn(options = {}) {
    if ((options.hasOwnProperty('platforms') && !isPlatform(options))) {
        skip();
    }

    if (options.hasOwnProperty('browsers') && !isBrowser(options)) {
        skip();
    }

    if (options.hasOwnProperty('headless') && !isHeadless(options)) {
        skip();
    }

    if (options.hasOwnProperty('tags') && !isTags(options)) {
        skip();
    }
}

Cypress.Commands.add('skipOn', skipOn);
Cypress.Commands.add('runOn', runOn);
