function emojiVerification(postId){
        const postMessageTextId=`#postMessageText_${postId}`;
	// # Check for the emoji attr of :) is exists
        cy.get(`${postMessageTextId} p span span.emoticon`).should('have.attr','title',':slightly_smiling_face:');
	// # Check for the punctuation('=') is exists without space
        cy.get(`${postMessageTextId} p`).should('same.text','=');
}



describe('Messaging', () => {
        it('M23360 - Emoji characters followed by punctuation', () => {
                // # Login and navigate to the app
                cy.apiLogin('user-1');
                cy.visit('/');

                // # Post a Meesage
                const messageText = ':)=';
                cy.postMessage(messageText);

                // # Get Last Post ID
                cy.getLastPostId().then((postId) => {
                        emojiVerification(postId);
                });
        });
});
