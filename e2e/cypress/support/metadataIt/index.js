// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const mochaIt = global.it;

function shouldRun(metadata) {
    // If we have metadata, and the metadata has tags
    // we need to determine if we should actually run
    // the test.
    const tag = Cypress.env('tag');

    // If there is a tag, we only want to run tests
    // that include that tag
    if (tag) {
        if (metadata.tags && metadata.tags.includes(tag)) {
            return true;
        }

        // if we have tags in env vars, but the test does
        // not include the tag, return false to skip it
        return false;
    }

    // We do not have tags, so return false to not skip the test
    return true;
}

function metadataIt(name, metadata, testFn) {
    if (typeof metadata != 'object') {
        throw new Error('mmIt Error: 2nd argument for metadata should be an object.');
    }

    if (typeof testFn != 'function') {
        throw new Error('mmIt Error: 3rd argument for test function should be a function.');
    }

    // Check if we should run this test, based on tags
    if (shouldRun(metadata)) {
        // Return the native mocha 'it' and attach
        // our metadata to the mocha context so it
        // is available for reporting
        return mochaIt(name, function() {
            this.test.metadata = metadata;
            return testFn();
        });
    }

    // If we should not run it, we should skip the test
    return mochaIt.skip(name, () => {
        // empty body for test
    });
}

// Support for chaining .only to a test to single out
// the specific test. Note that .only should only be
// used for local development. It does not support
// adding metadata to the test
metadataIt.only = function(name, metadata, testFn) {
    return mochaIt.only(name, () => {
        return testFn();
    });
};

// Support for chaining .skip to a test to skip
// the specific test. It does not support
// adding metadata to the test
metadataIt.skip = function(name) {
    return mochaIt.skip(name, () => {
        // empty body for test
    });
};

module.exports = metadataIt;