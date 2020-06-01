// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import users from '../../../fixtures/users.json';

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @extend_session

describe('Extend Session - Email Login', () => {
    const townSquarePage = '/ad-1/channels/town-square';
    const oneDay = 24 * 60 * 60 * 1000;
    const testUser = 'user-1';

    before(() => {
        // # Login as sysadmin and check if with license and has matching database
        cy.apiLogin('sysadmin');
        cy.requireLicense();
        cy.requireServerDBToMatch();
    });

    beforeEach(() => {
        // # Login as sysadmin and revoke sessions of the test user
        cy.apiLogin('sysadmin');
        cy.dbGetUser({username: testUser}).then(({user}) => {
            cy.apiRevokeUserSessions(user.id);
        });
    });

    it('should redirect to login page when session expired', () => {
        // # Update system config
        const setting = {
            ServiceSettings: {
                ExtendSessionLengthWithActivity: true,
                SessionLengthWebInDays: 1,
            },
        };
        cy.apiUpdateConfig(setting);

        // # Login as test user and go to town-square channel
        cy.apiLogin(testUser);
        cy.visit(townSquarePage);

        // # Get active user sessions as baseline reference
        cy.dbGetActiveUserSessions({username: testUser}).then(({sessions: initialSessions}) => {
            // Post a message to a channel
            cy.postMessage(Date.now());

            const expiredSession = parseDateTime(initialSessions[0].createat, 10) + 1;

            // # Update user with expired session
            cy.dbUpdateUserSession({
                userId: initialSessions[0].userid,
                sessionId: initialSessions[0].id,
                fieldsToUpdate: {expiresat: expiredSession},
            }).then(({session: updatedSession}) => {
                // * Verify that the session is updated
                expect(parseDateTime(updatedSession.expiresat)).to.equal(expiredSession);

                // # Invalidate cache and reload to take effect the expired session
                cy.externalRequest({user: users.sysadmin, method: 'POST', path: 'caches/invalidate'});
                cy.reload();

                // # Try to visit town-square channel
                cy.visit(townSquarePage);

                // * Verify that it redirects to login page due to expired session
                cy.url().should('include', `/login?redirect_to=${townSquarePage.replace(/\//g, '%2F')}`);

                // * Get user's active session of test user and verify that it remained as expired and is not extended
                cy.dbGetActiveUserSessions({username: testUser}).then(({sessions: activeSessions}) => {
                    expect(activeSessions.length).to.equal(0);

                    cy.dbGetUserSession({sessionId: initialSessions[0].id}).then(({session: unExtendedSession}) => {
                        expect(parseDateTime(unExtendedSession.expiresat)).to.equal(expiredSession);
                    });
                });
            });
        });
    });

    const visitAChannel = () => {
        cy.visit(townSquarePage);
        cy.url().should('not.include', '/login?redirect_to');
        cy.url().should('include', townSquarePage);
    };

    const postAMessage = (now) => {
        cy.postMessage(now);
        cy.getLastPost().should('contain', now);
    };

    const testCases = [{
        name: 'on visit to a channel',
        fn: visitAChannel,
        sessionLengthInDays: 1,
    }, {
        name: 'on posting a message',
        fn: postAMessage,
        sessionLengthInDays: 1,
    }, {
        name: 'on visit to a channel',
        fn: visitAChannel,
        sessionLengthInDays: 30,
    }, {
        name: 'on posting a message',
        fn: postAMessage,
        sessionLengthInDays: 30,
    }];

    testCases.forEach((testCase) => {
        it(`with SessionLengthWebInDays ${testCase.sessionLengthInDays} and threshold met, should extend session ${testCase.name}`, () => {
            // # Update system config
            const setting = {
                ServiceSettings: {
                    ExtendSessionLengthWithActivity: true,
                    SessionLengthWebInDays: testCase.sessionLengthInDays,
                },
            };
            cy.apiUpdateConfig(setting);

            const fifteenMinutes = (15 * 60 * 1000);

            // # Login as test user and go to town-square channel
            cy.apiLogin(testUser);
            cy.visit(townSquarePage);

            // # Get active user sessions as baseline reference
            cy.dbGetActiveUserSessions({username: testUser}).then(({sessions: initialSessions}) => {
                // Post a message to a channel
                cy.postMessage(Date.now());

                const sessionToExpireSoon = Date.now() + fifteenMinutes;

                // # Update user with soon to expire session
                cy.dbUpdateUserSession({
                    userId: initialSessions[0].userid,
                    sessionId: initialSessions[0].id,
                    fieldsToUpdate: {expiresat: sessionToExpireSoon},
                }).then(({session: updatedSession}) => {
                    // * Verify that the session is updated
                    expect(parseDateTime(updatedSession.expiresat)).to.equal(sessionToExpireSoon);

                    cy.externalRequest({user: users.sysadmin, method: 'POST', path: 'caches/invalidate'});

                    // # Visit a channel or post a message
                    const now = Date.now();
                    testCase.fn(now);

                    // * Get user's active session of test user and verify that the session has been extended depending on SessionLengthWebInDays setting
                    cy.dbGetActiveUserSessions({username: testUser}).then(({sessions: extendedSessions}) => {
                        expect(extendedSessions[0].id).to.equal(updatedSession.id);
                        expect(parseDateTime(extendedSessions[0].expiresat)).to.be.greaterThan(parseDateTime(updatedSession.expiresat));

                        const fiveSeconds = 5000;
                        expect(parseDateTime(extendedSessions[0].expiresat)).to.be.closeTo(now + (oneDay * testCase.sessionLengthInDays), fiveSeconds);
                    });
                });
            });
        });
    });

    testCases.forEach((testCase) => {
        it(`with SessionLengthWebInDays ${testCase.sessionLengthInDays} and threshold not met, should not extend session ${testCase.name}`, () => {
            // # Update system config
            const setting = {
                ServiceSettings: {
                    ExtendSessionLengthWithActivity: true,
                    SessionLengthWebInDays: testCase.sessionLengthInDays,
                },
            };
            cy.apiUpdateConfig(setting);

            // # Login as test user and go to town-square channel
            cy.apiLogin(testUser);
            cy.visit(townSquarePage);

            // # Get active user sessions as baseline reference
            cy.dbGetActiveUserSessions({username: testUser}).then(({sessions: initialSessions}) => {
                const initialSession = initialSessions[0];
                cy.postMessage(Date.now());

                // # Invalidate cache and reload to take effect the expired session
                cy.externalRequest({user: users.sysadmin, method: 'POST', path: 'caches/invalidate'});

                // # Visit a channel or post a message
                const now = Date.now();
                testCase.fn(now);

                // * Get active user session of test user and verify that the session has remained the same and has not expired
                cy.dbGetActiveUserSessions({username: testUser}).then(({sessions: unExtendedSessions}) => {
                    const unExtendedSession = unExtendedSessions[0];
                    expect(initialSession.id).to.equal(unExtendedSession.id);
                    expect(parseDateTime(initialSession.expiresat)).to.equal(parseDateTime(unExtendedSession.expiresat));
                    expect(parseDateTime(initialSession.expiresat)).to.greaterThan(parseDateTime(Date.now()));
                });
            });
        });
    });

    function parseDateTime(value) {
        return parseInt(value, 10);
    }
});
