// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

function getLines(e) {
    const $cont = Cypress.$(e);
    const text_arr = $cont.text().split(" ");

    for (let i = 0; i < text_arr.length; i++) {
        text_arr[i] = "<span>" + text_arr[i] + " </span>";
    }

    $cont.html(text_arr.join(""));

    const $wordSpans = $cont.find("span");
    const lineArray = [];
    var lineIndex = 0,
        lineStart = true;

    $wordSpans.each(function(idx) {
        const top = Cypress.$(this).position().top;

        if (lineStart) {
            lineArray[lineIndex] = [idx];
            lineStart = false;
        } else {
            var $next = Cypress.$(this).next();

            if ($next.length) {
                if ($next.position().top > top) {
                    lineArray[lineIndex].push(idx);
                    lineIndex++;
                    lineStart = true;
                }
            } else {
                lineArray[lineIndex].push(idx);
            }
        }
    });
    return lineArray.length;
}

describe("System Message", () => {
    before(() => {
        // 1. Login and go to /
        cy.login("user-1");
        cy.visit("/");
    });

    it("MM-14636 - Validate that system message is wrapping properly", () => {
        // 2. Open channel header textbox
        cy.get("#channelHeaderDropdownButton")
            .should("be.visible")
            .click();
        cy.get("#channelHeaderDropdownMenu")
            .should("be.visible")
            .find("#channelEditHeader")
            .click();

        // 3. Enter short description
        cy.get("#edit_textbox")
            .clear()
            .type("> newheader")
            .type("{enter}")
            .wait(500);

        cy.getLastPost()
            .should("contain", "System")
            .and("contain", `user-1 updated the channel`);
        cy.getLastPost().then(function(desc) {
            const lines = getLines(desc.find("p")[1]); 
            assert(lines === 1, "second line of the message should be a short one");
        });

        // 4. Open channel header textbox
        cy.get("#channelHeaderDropdownButton")
            .should("be.visible")
            .click();
        cy.get("#channelHeaderDropdownMenu")
            .should("be.visible")
            .find("#channelEditHeader")
            .click();

        // 5. Enter long description
        cy.get("#edit_textbox")
            .clear()
            .type(">")
            .type(" newheader".repeat(20))
            .type("{enter}")
            .wait(500);

        cy.getLastPost()
            .should("contain", "System")
            .and("contain", `user-1 updated the channel`);

        cy.getLastPost().then(function(desc) {
            const lines = getLines(desc.find("p")[1]); 
            assert(lines > 1, "second line of the message should be a long one");
        });
    });
});
