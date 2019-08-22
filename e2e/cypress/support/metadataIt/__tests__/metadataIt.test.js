// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// This function is mocking basic behavior of mocha's it
function mockIt(name, testFn) {
    this.test = {};
    const status = testFn();
    return {status, test: this.test, name};
}

mockIt.only = (name, testFn) => {
    const status = testFn() + ' only';
    return {status, test: 'only', name};
};
mockIt.skip = (name) => {
    const status = 'skipped';
    return {status, test: 'skipped', name};
};

let metadataIt;

function setup(tag = null) {
    // metadataIt calls this from Cypress, since we are in Jest
    // Cypress does not exist, returning our desired tags here.
    global.Cypress = {
        env: () => {
            return tag;
        },
    };

    // This is not replacing jest's "it", at runtime
    // the jest tests are already established, this
    // changes the global it to mock mocha's it behavior.
    global.it = mockIt;

    // eslint-disable-next-line global-require
    metadataIt = require('../index.js');
}

describe('metadataIt', () => {
    beforeEach(() => {
        setup();
    });

    describe('default function', () => {
        it('is a function', () => {
            expect(typeof metadataIt).toEqual('function');
        });

        it('will run test with metadata', () => {
            const result = metadataIt('metadata', {testId: 'foo', tags: ['@tag']}, () => {
                return 'metadata passed';
            });

            expect(result.name).toEqual('metadata');
            expect(result.status).toEqual('metadata passed');
            expect(result.test.metadata).toEqual({testId: 'foo', tags: ['@tag']});
        });
    });

    describe('.skip', () => {
        it('is a function', () => {
            expect(typeof metadataIt.skip).toEqual('function');
        });

        it('can be marked as skipped with metadata', () => {
            const result = metadataIt.skip('metadata skipped', {testId: 'foo', tags: ['@tag']}, () => {
                return 'should be skipped';
            });

            expect(result.name).toEqual('metadata skipped');
            expect(result.status).toEqual('skipped');
            expect(result.test).toEqual('skipped');
        });
    });

    describe('.only', () => {
        it('is a function', () => {
            expect(typeof metadataIt.only).toEqual('function');
        });

        it('can be marked as only with metadata', () => {
            const result = metadataIt.only('metadata only', {testId: 'foo', tags: ['@tag']}, () => {
                return 'should run';
            });

            expect(result.name).toEqual('metadata only');
            expect(result.status).toEqual('should run only');
            expect(result.test).toEqual('only');
        });
    });
});

describe('metadataIt with tags', () => {
    beforeEach(() => {
        setup('@tag');
    });

    it('will run test with matching tag', () => {
        const result = metadataIt('tagged', {tags: ['@tag'], testId: 'foo'}, () => {
            return 'tagged passed';
        });

        expect(result.name).toEqual('tagged');
        expect(result.status).toEqual('tagged passed');
        expect(result.test.metadata).toEqual({testId: 'foo', tags: ['@tag']});
    });

    it('will run test that with matching tag while there are multiple tags in metadata', () => {
        const result = metadataIt('tagged', {tags: ['@tag', '@foo'], testId: 'foo'}, () => {
            return 'tagged passed';
        });

        expect(result.name).toEqual('tagged');
        expect(result.status).toEqual('tagged passed');
        expect(result.test.metadata).toEqual({testId: 'foo', tags: ['@tag', '@foo']});
    });

    it('will not run test that does not have matching tag', () => {
        const result = metadataIt('not tagged', {testId: 'foo'}, () => {
            return 'should not run';
        });

        expect(result.name).toEqual('not tagged');
        expect(result.status).toEqual('skipped');
        expect(result.test).toEqual('skipped');
    });
});
