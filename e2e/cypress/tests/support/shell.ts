// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from './api/types';

function shellFind(path: string, pattern: RegExp): ChainableT<any> {
    return cy.task('shellFind', {path, pattern});
}
Cypress.Commands.add('shellFind', shellFind);

function shellRm(option: any, file: string): ChainableT<any> {
    return cy.task('shellRm', {option, file});
}
Cypress.Commands.add('shellRm', shellRm);

function shellUnzip(source: string, target: string): ChainableT<any> {
    return cy.task('shellUnzip', {source, target});
}
Cypress.Commands.add('shellUnzip', shellUnzip);

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * Find file/s similar to "find" shell command
             * Extends find of shelljs, https://github.com/shelljs/shelljs#findpath--path-
             *
             * @param {string} path - file path
             * @param {RegExp} pattern - pattern to match with
             *
             * @example
             *    cy.shellFind('path', '/file.xml/').then((files) => {
             *        // do something with files
             *    });
             */
            shellFind: typeof shellFind;

            /**
             * Remove file/s similar to "rm" shell command
             * Extends rm of shelljs, https://github.com/shelljs/shelljs#rmoptions-file--file-
             *
             * @param {string} option - ex. -rf
             * @param {string} file - file/pattern to remove
             *
             * @example
             *    cy.shellRm('-rf', 'file.png');
             */
            shellRm: typeof shellRm;

            /**
             * Unzip source file into a target folder
             *
             * @param {string} source - source file
             * @param {string} target - target folder
             *
             * @example
             *    cy.shellUnzip('source.zip', 'target-folder');
             */
            shellUnzip: typeof shellUnzip;
        }
    }
}
