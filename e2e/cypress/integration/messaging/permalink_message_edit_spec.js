// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [number] indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************


describe('Permalink message edit', () => {
	it('M18717 - Edit a message in permalink view', () => {
		// # Login as "user-1" and go to /
		cy.apiLogin('user-1');
		cy.visit('/');

		const searchWord = 'searchtest';
		
		// # Post message
		cy.postMessage(searchWord)
		
		// # Search for searchWord
		cy.get('#searchBox').type(searchWord).type('{enter}').then(() => {
		
			// # Jump to permalink view	
			cy.get('.search-item__jump').first().click()
			
			cy.getLastPostId().then((postId) => {
				// # Click on ... button of last post matching the searchWord
				cy.clickPostDotMenu(postId);
				
				// # Click on edit post
				cy.get(`#edit_post_${postId}`).click();
				
				// # Add new text in edit box
				cy.get('#edit_textbox').clear().type('edited searchtest');
				
				// # Click edit button
				cy.get('#editButton').click();
				
				// # Check edited post
				cy.get(`#postMessageText_${postId}`).should('contain', 'edited searchtest')
				cy.get(`#postEdited_${postId}`).should('contain', '(edited)')
				
				// # Logout as "user-1"
				cy.apiLogout('user-1');
				
				// # Login as "user-2" and go to /
				cy.apiLogin('user-2');
				cy.visit('/');
				
				// # Find searchWord and verify edited post
				cy.get('#searchBox').type(searchWord).type('{enter}').then(() => {
					cy.get('.search-item__jump').first().click()
					cy.get(`#postMessageText_${postId}`).should('contain', 'edited searchtest')
					cy.get(`#postEdited_${postId}`).should('contain', '(edited)')
				});
			});
		});
	});
});
