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

                // # Create a user for each of the new admin roles.
                cy.apiPatchUserRoles(user.id, ['system_user', roleName]);
            });
        });
    });

    it('sidebar menu items are visible or hidden', () => {
        const notExists = (section) => {
            cy.get(`[data-testid="${section}"]`).should('not.exist');
        };
        const exists = (section) => {
            cy.get(`[data-testid="${section}"]`).should('exist');
        };
        forEachConsoleSection(notExists, exists, exists);
    });

    it('sections are read-only to roles', () => {
        const noOp = () => null;
        const checkDisabled = checkInputsShould('be.disabled');
        forEachConsoleSection(noOp, checkDisabled, noOp);
    });

    it('sections are read-write to roles', () => {
        const noOp = () => null;
        const checkEnabled = checkInputsShould('be.enabled');
        forEachConsoleSection(noOp, noOp, checkEnabled);
    });

    const checkInputsShould = (shouldString) => (section) => {
        const {disabledInputs} = disabledTests.find((item) => item.section === section);
        Cypress._.forEach(disabledInputs, ({path, selector}) => {
            if (path.length && selector.length) {
                cy.visit(path, {timeout: 30000});
                cy.get(selector).should(shouldString);
            }
        });
    };

    function forEachConsoleSection(noAccessF, readOnlyF, readWriteF) {
        Cypress._.forEach(roleNames, (roleName) => {
            const user = testUsers[roleName];

            // # Login as each new role.
            cy.apiLogin(user);

            // # Go the system console.
            cy.visit('/admin_console');

            accessRules.forEach((rule) => {
                const {section} = rule;
                const access = rule[roleName];
                switch (access) {
                case ACCESS_NONE:
                    noAccessF(section);
                    break;
                case ACCESS_READ_ONLY:
                    readOnlyF(section);
                    break;
                case ACCESS_READ_WRITE:
                    readWriteF(section);
                    break;
                }
            });
        });
    }
});
