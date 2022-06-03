// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @collapsed_reply_threads

import * as MESSAGES from '../../fixtures/messages';
import {matterpollPlugin} from '../../utils/plugins';
import {waitUntilUploadComplete, interceptFileUpload} from '../files_and_attachments/helpers';

describe('Collapsed Reply Threads', () => {
    let testTeam;
    let testChannel;
    let user1;

    const files = [
        {
            testCase: 'MM-T4777_2',
            filename: 'word-file.doc',
            extensions: 'DOC',
            icon: 'icon-file-word-outline',
        },
        {
            testCase: 'MM-T4777_3',
            filename: 'wordx-file.docx',
            extensions: 'DOCX',
            icon: 'icon-file-word-outline',
        },
        {
            testCase: 'MM-T4777_4',
            filename: 'powerpoint-file.ppt',
            extensions: 'PPT',
            icon: 'icon-file-powerpoint-outline',
        },
        {
            testCase: 'MM-T4777_5',
            filename: 'powerpointx-file.pptx',
            extensions: 'PPTX',
            icon: 'icon-file-powerpoint-outline',
        },
        {
            testCase: 'MM-T4777_6',
            filename: 'mp3-audio-file.mp3',
            extensions: 'MP3',
            icon: 'icon-file-audio-outline',
        },
        {
            testCase: 'MM-T4777_7',
            filename: 'mp4-video-file.mp4',
            extensions: 'MP4',
            icon: 'icon-file-video-outline',
        },
        {
            testCase: 'MM-T4777_8',
            filename: 'theme.json',
            extensions: 'JSON',
            icon: 'icon-file-code-outline',
        },
    ];

    before(() => {
        cy.apiUpdateConfig({
            PluginSettings: {
                Enable: true,
            },
            ServiceSettings: {
                ThreadAutoFollow: true,
                CollapsedThreads: 'default_off',
            },
        });

        // # Create new channel and other user, and add other user to channel
        cy.apiInitSetup({loginAfter: true, promoteNewUserAsAdmin: true}).then(({team, channel, user}) => {
            testTeam = team;
            user1 = user;
            testChannel = channel;

            cy.apiSaveCRTPreference(user1.id, 'on');
        });
    });

    beforeEach(() => {
        // # Visit the channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        interceptFileUpload();
    });

    it('MM-T4776 should display poll text without Markdown in the threads list', () => {
        cy.shouldNotRunOnCloudEdition();
        cy.shouldHavePluginUploadEnabled();

        // # Upload and enable "matterpoll" plugin
        cy.apiUploadAndEnablePlugin(matterpollPlugin);

        // # In center post the following: /poll "Do you like https://mattermost.com?"
        cy.postMessage('/poll "Do you like https://mattermost.com?"');

        cy.getLastPostId().then((pollId) => {
            // # Post a reply on the POLL to create a thread and follow
            cy.postMessageAs({sender: user1, message: MESSAGES.SMALL, channelId: testChannel.id, rootId: pollId});

            // # Click "Yes" or "No"
            cy.findByText('Yes').click();

            // # Visit global threads
            cy.uiClickSidebarItem('threads');

            // * Text in ThreadItem should say 'username: Do you like https://mattermost.com?'
            cy.get('.attachment__truncated').first().should('have.text', user1.nickname + ': Do you like https://mattermost.com?');

            // * Text in ThreadItem should say 'Total votes: 1'
            cy.get('.attachment__truncated').last().should('have.text', 'Total votes: 1');

            // # Open the thread
            cy.get('.ThreadItem').last().click();

            // # Go to channel
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

            // # End the poll
            cy.findByText('End Poll').click();
            cy.findByText('End').click();

            // # Visit global threads
            cy.uiClickSidebarItem('threads');

            // * Text in ThreadItem should say 'username: Do you like https://mattermost.com?'
            cy.get('.attachment__truncated').first().should('have.text', user1.nickname + ': Do you like https://mattermost.com?');

            // * Text in ThreadItem should say 'This poll has ended. The results are:'
            cy.get('.attachment__truncated').last().should('have.text', 'This poll has ended. The results are:');

            // # Cleanup
            cy.apiDeletePost(pollId);
        });
    });

    it('MM-T4777_1 should show image thumbnail in thread list item', () => {
        const image = 'jpg-image-file.jpg';

        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(image);
        waitUntilUploadComplete();
        cy.get('.post-image__thumbnail').should('be.visible');
        cy.get('#post_textbox').clear().type('{enter}');

        cy.getLastPostId().then((rootId) => {
            // # Post a reply to create a thread and follow
            cy.postMessageAs({sender: user1, message: MESSAGES.SMALL, channelId: testChannel.id, rootId});

            // # Visit Global Threads
            cy.uiClickSidebarItem('threads');

            // * Text should be the filename
            cy.get('.file_card__name').should('have.text', image);

            // * Image should be shown
            cy.get('.file_card__image.post-image.small').should('be.visible');

            // # Cleanup
            cy.apiDeletePost(rootId);
        });
    });

    files.forEach((file) => {
        it(`${file.testCase} should display correct icon for ${file.extensions} on threads list`, () => {
            // # Post a file
            cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(file.filename);
            waitUntilUploadComplete();
            cy.get('.post-image__thumbnail').should('be.visible');
            cy.get('#post_textbox').clear().type('{enter}');

            cy.getLastPostId().then((rootId) => {
                // # Post a reply to create a thread and follow
                cy.postMessageAs({sender: user1, message: MESSAGES.SMALL, channelId: testChannel.id, rootId});

                // # Visit Global Threads
                cy.uiClickSidebarItem('threads');

                // * Thread item should display the correct icon
                cy.get('.file_card__attachment').should('have.class', file.icon);

                // * Thread item should display text
                cy.get('.file_card__name').should('have.text', file.filename);

                // # Cleanup
                cy.apiDeletePost(rootId);
            });
        });
    });
});
