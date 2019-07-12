// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***********************************************************
// Read more at: https://on.cypress.io/configuration
// ***********************************************************

/* eslint-disable no-loop-func */

import './ui_commands';
import './api_commands';
import './task_commands';
import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';
import addContext from 'mochawesome/addContext';

Cypress.on('test:after:run', (test, runnable) => {
    // Only if the test is failed to we want ot add
    // the additional context of the screenshot.
    if (test.state === 'failed') {
        let filename = Cypress.spec.name + '/';
        let parentNames = '';

        // Define our starting parent
        let parent = runnable.parent;

        // If the test failed due to a hook, we have to handle
        // getting our starting parent to form the correct filename.
        if (test.failedFromHookId) {
            // Failed from hook Id is always something like 'h2'
            // We just need tho trailing number to match with parent id
            const hookId = test.failedFromHookId.split('')[1];

            // If the current parentId does not match our hook id
            // start digging upwards until we get the parent that
            // has the same hook id, or until we get to a tile of ''
            // (which means we are at the top level)
            if (parent.id !== `r${hookId}`) {
                while (parent.parent.id !== `r${hookId}`) {
                    if (parent.title === '') {
                        // If we have a title of '' we have reached the top parent
                        break;
                    } else {
                        parent = parent.parent;
                    }
                }
            }
        }

        // Now we can go from parent to parent to generate the screenshot filename
        while (parent) {
            // Only append parents that have actual content for their titles
            if (parent.title !== '') {
                parentNames = parent.title + ' -- ' + parentNames;
            }

            parent = parent.parent;
        }

        // If the test has a hook name, that means it failed due to a hook
        // and consequently Cypress appends some text to the file name
        const hookName = test.hookName ? ' -- ' + test.hookName + ' hook' : '';

        filename += parentNames + test.title + hookName + ' (failed).png';

        // Clean up filename of characters that Cypress strips out
        filename = filename.replace(/[;:"<>/]/g, '');

        // Add context to the mochawesome report which includes the screenshot
        addContext({test}, {
            title: 'Failing Screenshot: >> screenshots/' + filename,
            value: 'screenshots/' + filename,
        });
    }
});

// Add login cookies to whitelist to preserve it
beforeEach(() => {
    Cypress.Cookies.preserveOnce('MMAUTHTOKEN', 'MMUSERID', 'MMCSRF');
});
