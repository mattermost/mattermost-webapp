// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe("Message Draft", () => {
    before(() => {
        // 1. Login and go to /
        cy.login("sysadmin");
        cy.visit("/");
    });

    it("should show only 1 header when user send multiple posts", () => {
        // 2. Get all post from current user
        cy.get("#postListContent > .post.current--user")
            .then($allPosts => $allPosts.length) // retain previous nb posts to be able to relaunch this test multi times
            .then($nbPosts => {
                // 3. Post message "One", "Two" and "Three"
                cy.get("#post_textbox")
                    .type("One")
                    .type("{enter}");
                cy.get("#post_textbox")
                    .type("Two")
                    .type("{enter}");
                cy.get("#post_textbox")
                    .type("Three")
                    .type("{enter}");

                // 4. Name and profile pic display on One post only, not on Two or Three
                cy.get("#postListContent > .post.current--user")
                    //* Assert 3 new posts are added
                    .should("have.length", $nbPosts + 3)
                    .first()
                    .then($post => {
                        //* Assert only 1 img is present on the first post
                        cy.get(
                            "#postListContent > .post.current--user > .post__content > .post__img > span > img"
                        )
                            .should("have.length", 1)
                            .parentsUntil("#postListContent")
                            .last()
                            .then(p => assert.equal(p[0], $post[0]));
                    });
            });
    });
});
