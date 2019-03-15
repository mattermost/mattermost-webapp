describe('Test Long post with attachements, Test key= M14322', ()=>{
    before(()=>{
        cy.login('user-1');
        cy.visit('/');
    
        // Add 4 attachments
        cy.uploadFile('#fileUploadButton input', '../fixtures/mattermost-icon.png', 'image/png')
        cy.uploadFile('#fileUploadButton input', '../fixtures/mattermost-icon.png', 'image/png')
        cy.uploadFile('#fileUploadButton input', '../fixtures/mattermost-icon.png', 'image/png')
        cy.uploadFile('#fileUploadButton input', '../fixtures/longTextPost.txt', 'text/txt')

       // Add a long post
       cy.fixture('./longTextPost.txt').then(data =>{
           cy.postMessage(data);
       });
       cy.wait(500);
    })


    it('Attachment previews/thumbnails display as expected, when viewing full or partial post', ()=>{
        // Get the last PostId and check if the 4 attachments are posted 
        cy.getLastPostId().then((postID) => {
            cy.get(`#${postID}_message>.post-image__columns`).children().should('have.length', '4');
            })
    })


    it('Can click one of the attachments and cycle through the multiple attachment previews as usual', ()=>{
        // Preview the first attachment
        cy.getLastPostId().then((postID) => {
            cy.get(`#${postID}_message>.post-image__columns`).children().first().click();
            cy.wait(1000);

            // Preview the next attachments
            for (var i = 0; i<3;i++){
                cy.get('#previewArrowRight>.image-control').click();
                cy.wait(1000);
            }
        })
        //Close the preview
        cy.get('.modal-close').should('be.visible').click()
    })
})
