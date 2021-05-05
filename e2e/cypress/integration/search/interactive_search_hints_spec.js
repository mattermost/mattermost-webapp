describe('Search',()=>{
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });
    it('MM-T2920 - Verify search hints do not display over top of the user autocomplete',()=>{
        // # Write something on the input
        cy.get('#searchBox').clear().type('from: ');

        // * The input should contain what we wrote
        cy.get('#searchBox').should('have.value', 'from: ');

        //* Verify that the auto complete element is visible
        cy.get('.search-autocomplete__item').should('be.visible');

        //* Take a screenshot so that users can verify that autocomplete elements isnt displayed on top of search 
        cy.screenshot('search-hints-display')
    });
    it('MM-T2920 - Search modifier (which is no longer visible) should not replace the keyword you just typed',()=>{
        const searchWord = 'Test Environment';

        // # Click the X to clear the input field
        cy.get('#searchFormContainer').find('.input-clear-x').click({force: true});

        //* Click on search bar
        cy.get('#searchBox').click();

        //* Hover over to one of hints
        cy.get('div#searchbar-help-popup div.popover-content > div').first().trigger('mouseover');

        // # Post a message
        cy.postMessage(searchWord);

        // # Search word in searchBox and validate searchWord
        cy.get('#searchBox').click().type(searchWord + '{enter}').should('have.value', searchWord);
    });
})