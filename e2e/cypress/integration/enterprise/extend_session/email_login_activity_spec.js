// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getAdminAccount} from '../../../support/env';

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @extend_session

describe('MM-T2575 Extend Session - Email Login', () => {
    let townSquarePage;
    const oneDay = 24 * 60 * 60 * 1000;
    const admin = getAdminAccount();
    let testUser;

    before(() => {
        // # Check if with license and has matching database
        cy.apiRequireLicense();

        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            townSquarePage = `/${team.name}/channels/town-square`;
        });
    });

    beforeEach(() => {
        // # Login as sysadmin and revoke sessions of the test user
        cy.apiAdminLogin();
        cy.apiRevokeUserSessions(testUser.id);
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
        cy.dbGetActiveUserSessions({username: testUser.username}).then(({sessions: initialSessions}) => {
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
                cy.externalRequest({user: admin, method: 'POST', path: 'caches/invalidate'});
                cy.reload();

                // # Try to visit town-square channel
                cy.visit(townSquarePage);

                // * Verify that it redirects to login page due to expired session
                cy.url().should('include', `/login?redirect_to=${townSquarePage.replace(/\//g, '%2F')}`);

                // * Get user's active session of test user and verify that it remained as expired and is not extended
                cy.dbGetActiveUserSessions({username: testUser.username}).then(({sessions: activeSessions}) => {
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

            // # Login as test user and go to town-square channel
            cy.apiLogin(testUser);
            cy.visit(townSquarePage);

            // # Get active user sessions as baseline reference
            cy.dbGetActiveUserSessions({username: testUser.username}).then(({sessions: initialSessions}) => {
                const initialSession = initialSessions[0];

                // Post a message to a channel
                cy.postMessage(Date.now());

                // Elapsed time of 1.1% or a bit above 1.00%
                const elapsedAboveThreshold = parseDateTime(initialSession.expiresat) - (testCase.sessionLengthInDays * oneDay * 0.011);

                // # Update the user session with new expiration to simulate that
                // # the session has elapsed just above 1% of session length.
                cy.dbUpdateUserSession({
                    userId: initialSession.userid,
                    sessionId: initialSession.id,
                    fieldsToUpdate: {expiresat: elapsedAboveThreshold},
                }).then(({session: updatedSession}) => {
                    // * Verify that the session is updated
                    expect(parseDateTime(updatedSession.expiresat)).to.equal(elapsedAboveThreshold);

                    // # Invalidate cache and reload to take effect the new session
                    cy.externalRequest({user: admin, method: 'POST', path: 'caches/invalidate'});
                    cy.reload();

                    // # Visit a channel or post a message
                    const now = Date.now();
                    testCase.fn(now);

                    // * Get active session of test user and verify that the session has been extended depending on SessionLengthWebInDays setting
                    cy.dbGetActiveUserSessions({username: testUser.username}).then(({sessions: extendedSessions}) => {
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
            cy.dbGetActiveUserSessions({username: testUser.username}).then(({sessions: initialSessions}) => {
                const initialSession = initialSessions[0];

                // Post a message to a channel
                cy.postMessage(Date.now());

                // Elapsed time of 0.9% or a bit below 1.00%
                const elapsedBelowThreshold = parseDateTime(initialSession.expiresat) - (testCase.sessionLengthInDays * oneDay * 0.009);

                // # Update the user session with new expiration to simulate that
                // # the session has elapsed just below 1% of session length.
                cy.dbUpdateUserSession({
                    userId: initialSession.userid,
                    sessionId: initialSession.id,
                    fieldsToUpdate: {expiresat: elapsedBelowThreshold},
                }).then(({session: updatedSession}) => {
                    // * Verify that the session is updated
                    expect(parseDateTime(updatedSession.expiresat)).to.equal(elapsedBelowThreshold);

                    // # Invalidate cache and reload to take effect the new session
                    cy.externalRequest({user: admin, method: 'POST', path: 'caches/invalidate'});
                    cy.reload();

                    // # Visit a channel or post a message
                    const now = Date.now();
                    testCase.fn(now);

                    // * Get active session of test user and verify that the session has remained the same and has not extended
                    cy.dbGetActiveUserSessions({username: testUser.username}).then(({sessions: unExtendedSessions}) => {
                        const unExtendedSession = unExtendedSessions[0];
                        expect(initialSession.id).to.equal(unExtendedSession.id);
                        expect(elapsedBelowThreshold).to.equal(parseDateTime(unExtendedSession.expiresat));
                    });
                });
            });
        });
    });

    function parseDateTime(value) {
        return parseInt(value, 10);
    }
});
