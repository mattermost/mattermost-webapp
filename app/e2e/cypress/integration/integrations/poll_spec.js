// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
 * Note: This test requires "matterpoll" plugin tar file under fixtures folder.
 * Download from: https://github.com/matterpoll/matterpoll
 * Copy to: ./e2e/cypress/fixtures/com.github.matterpoll.matterpoll.tar.gz
 */

import * as MESSAGES from '../../fixtures/messages';

describe('/poll', () => {
    let user1;
    let user2;
    let testChannelUrl;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            user1 = user;
            testChannelUrl = `/${team.name}/channels/town-square`;

            cy.apiCreateUser().then(({user: otherUser}) => {
                user2 = otherUser;

                cy.apiAddUserToTeam(team.id, user2.id);
            });
        });

        cy.apiUpdateConfig({
            PluginSettings: {
                Enable: true,
                RequirePluginSignature: false,
            },
        });

        // # Upload and enable "matterpoll" plugin
        cy.apiUploadPlugin('com.github.matterpoll.matterpoll.tar.gz').then(() => {
            cy.apiEnablePluginById('com.github.matterpoll.matterpoll');
        });
    });

    beforeEach(() => {
        cy.apiLogout();
        cy.apiLogin(user1);
        cy.visit(testChannelUrl);
    });

    after(() => {
        // # Uninstall "matterpoll" plugin
        cy.apiAdminLogin();
        cy.apiRemovePluginById('com.github.matterpoll.matterpoll');
    });

    it('MM-T576_1 /poll', () => {
        // # In center post the following: /poll "Do you like https://mattermost.com?"
        cy.postMessage('/poll "Do you like https://mattermost.com?"');

        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                // * Poll displays as expected in center
                cy.findByLabelText('matterpoll').should('be.visible');

                // * Mattermost URL renders as a live link
                cy.contains('a', 'https://mattermost.com').
                    should('have.attr', 'href', 'https://mattermost.com');

                // # Click "Yes" or "No"
                cy.findByText('Yes').click();
            });
        });

        // * After clicking Yes or No, ephemeral message displays "Your vote has been counted"
        cy.uiWaitUntilMessagePostedIncludes('Your vote has been counted.');

        // * If you go back and change your vote to another answer, ephemeral message displays "Your vote has been updated."
        cy.getNthPostId(-2).then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                cy.findByText('No').click();
            });
        });
        cy.uiWaitUntilMessagePostedIncludes('Your vote has been updated');

        // # Click to reply on any message to open the RHS
        cy.postMessage(MESSAGES.SMALL);
        cy.clickPostCommentIcon();

        cy.get('#rhsContainer').within(() => {
            // # In RHS, post `/poll Reply`
            cy.get('#reply_textbox').type('/poll reply{enter}');

            // * Poll displays as expected in RHS.
            cy.findByLabelText('matterpoll').should('be.visible');
        });

        cy.apiLogout();
        cy.apiLogin(user2);
        cy.visit(testChannelUrl);

        // # Another user clicks Yes or No
        cy.getNthPostId(-3).then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                cy.findByText('No').click();
            });
        });

        cy.apiLogout();
        cy.apiLogin(user1);
        cy.visit(testChannelUrl);
        cy.getNthPostId(-3).then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                cy.findByText('End Poll').click();
            });
        });

        cy.findByText('End').click();

        // * Username displays the same on the original poll post and on the "This poll has ended" post
        cy.uiWaitUntilMessagePostedIncludes('The poll Do you like https://mattermost.com? has ended');
        cy.getNthPostId(-4).then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                cy.contains('This poll has ended').should('be.visible');
                cy.findByText(user1.nickname).should('be.visible');
            });
        });
    });

    it('MM-T576_2 /poll', () => {
        // # Type and enter: `/poll "Q" "A1" "A2"`
        cy.postMessage('/poll "Q" "A1" "A2"');

        // # Click an answer option
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                cy.contains('Total votes: 0').should('be.visible');
                cy.findByText('A1').click();

                // * The vote count to go up
                cy.contains('Total votes: 1').should('be.visible');
            });
        });

        //* User who voted sees a message that their vote was counted
        cy.uiWaitUntilMessagePostedIncludes('Your vote has been counted.');
    });

    it('MM-T576_3 /poll', () => {
        cy.postMessage('/poll "Do you like https://mattermost.com?"');
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                cy.findByText('Yes').click();
            });
        });
        cy.apiLogout();
        cy.apiLogin(user2);
        cy.visit(testChannelUrl);
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                cy.findByText('Yes').click();
            });
        });
        cy.apiLogout();
        cy.apiLogin(user1);
        cy.visit(testChannelUrl);
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                // # Click "End Poll"
                cy.findByText('End Poll').click();
            });
        });
        cy.findByText('End').click();

        // * There is a message in the channel that the Poll has ended with a "here" link to view the responses
        cy.uiWaitUntilMessagePostedIncludes('The poll Do you like https://mattermost.com? has ended and the original post has been updated. You can jump to it by pressing here.');
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                cy.contains('a', 'here').click();
            });
        });

        // * Clicking the link highlight the poll post in the center channel
        cy.getNthPostId(-2).then((postId) => {
            cy.get(`#post_${postId}`).should('have.class', 'post--highlight');
            cy.get(`#post_${postId}`).within(() => {
                // * Users who voted are listed below the responses
                cy.findByText(`@${user1.username}`).should('be.visible');
                cy.findByText(`@${user2.username}`).should('be.visible');
            });
        });
    });

    it('MM-T576_4 /poll', () => {
        // # Type and enter `/poll ":pizza:" ":thumbsup:" ":thumbsdown:"`
        cy.postMessage('/poll  ":pizza:" ":thumbsup:" ":thumbsdown:"');

        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                // * Poll displays showing a slice of pizza emoji in place of the word "pizza"
                cy.get('h1 > span[data-emoticon="pizza"]').should('be.visible');
                cy.findByText('pizza').should('not.be.visible');

                // * Emoji for "thumbsup" and "thumbsdown" are shown in place of the words "yes" and "no"
                cy.get('button > span[data-emoticon="thumbsup"]').should('be.visible');
                cy.get('button > span[data-emoticon="thumbsdown"]').should('be.visible');
                cy.findByText('thumbsup').should('not.be.visible');
                cy.findByText('thumbsdown').should('not.be.visible');
            });
        });
    });
});
