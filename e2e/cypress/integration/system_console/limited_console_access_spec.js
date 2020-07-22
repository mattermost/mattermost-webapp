// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import accessRules from '../../fixtures/system-roles-console-access';
import disabledTests from '../../fixtures/console-example-inputs';

describe('Limited console access', () => {
    const roleNames = ['system_manager', 'system_user_manager', 'system_read_only_admin'];
    const ACCESS_NONE = 'none';
    const ACCESS_READ_ONLY = 'read';
    const ACCESS_READ_WRITE = 'read+write';
    const testUsers = {};

    before(() => {
        Cypress._.forEach(roleNames, (roleName) => {
            cy.apiCreateUser().then(({user}) => {
                testUsers[roleName] = user;
                cy.apiPatchUserRoles(user.id, ['system_user', roleName]);
            });
        });
    });

    it('sidebar menu items are visible or hidden', () => {
        Cypress._.forEach(roleNames, (roleName) => {
            const user = testUsers[roleName];
            cy.apiLogin(user);
            cy.visit('/admin_console');

            cy.log(`testing sidebar access of ${roleName}`);

            accessRules.forEach((rule) => {
                const {section} = rule;
                const access = rule[roleName];
                switch (access) {
                case ACCESS_NONE:
                    cy.get(`[data-testid="${section}"]`).should('not.exist');
                    break;
                case ACCESS_READ_ONLY:
                case ACCESS_READ_WRITE:
                    cy.get(`[data-testid="${section}"]`).should('exist');
                    break;
                }
            });
        });
    });

    it('sections are read-only to roles', () => {
        Cypress._.forEach(roleNames, (roleName) => {
            const user = testUsers[roleName];
            cy.apiLogin(user);
            cy.visit('/admin_console');

            cy.log(`testing read-only access of ${roleName}`);

            Cypress._.forEach(accessRules, (rule) => {
                const {section} = rule;
                const access = rule[roleName];
                if (access === ACCESS_READ_ONLY) {
                    // Look at one input element per section to see that it's disabled in read-only mode.
                    const {disabledInputs} = disabledTests.find((item) => item.section === section);

                    Cypress._.forEach(disabledInputs, ({path, selector}) => {
                        if (path.length && selector.length) {
                            cy.visit(path, {timeout: 30000});

                            cy.log(`testing that ${selector} at ${path} is disabled`);

                            cy.get(selector).should('be.disabled');
                        }
                    });
                }
            });
        });
    });

    it('sections are read-write to roles', () => {
        Cypress._.forEach(roleNames, (roleName) => {
            const user = testUsers[roleName];
            cy.apiLogin(user);
            cy.visit('/admin_console');

            cy.log(`testing read-write access of ${roleName}`);

            Cypress._.forEach(accessRules, (rule) => {
                const {section} = rule;
                const access = rule[roleName];

                if (access === ACCESS_READ_WRITE) {
                    // Look at one input element per section to see that it's disabled in read-only mode.
                    const {disabledInputs} = disabledTests.find((item) => item.section === section);

                    Cypress._.forEach(disabledInputs, ({path, selector}) => {
                        if (path.length && selector.length) {
                            cy.visit(path, {timeout: 30000});

                            cy.log(`testing that ${selector} at ${path} is not disabled`);

                            cy.get(selector).should('be.enabled');
                        }
                    });
                }
            });
        });
    });
});