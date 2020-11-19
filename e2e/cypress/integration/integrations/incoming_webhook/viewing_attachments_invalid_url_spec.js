// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

describe('Integrations', () => {
    let testUser;
    let testTeam;
    let testChannel;
    let newIncomingHook;
    let incomingWebhook;

    before(() => {
        // # Create new setup
        cy.apiInitSetup().then(({user}) => {
            testUser = user;

            // # Login as the new user
            cy.apiLogin(testUser).then(() => {
                // # Create a new team with the new user
                cy.apiCreateTeam('test-team', 'Team Testers').then(({team}) => {
                    testTeam = team;

                    // # Create a new test channel for the team
                    cy.apiCreateChannel(testTeam.id, 'test-channel', 'Testers Channel').then(({channel}) => {
                        testChannel = channel;

                        // # Declare web-hook values
                        newIncomingHook = {
                            channel_id: testChannel.id,
                            channel_locked: true,
                            description: 'Test Webhook Description',
                            display_name: 'Test Webhook Name',
                        };

                        //# Create a new webhook
                        cy.apiCreateWebhook(newIncomingHook).then((hook) => {
                            incomingWebhook = hook;
                        });

                        // # Visit the test channel
                        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
                    });
                });
            });
        });
    });

    it('MM-T624 Viewing attachments with invalid URL does not cause the application to crash', () => {
        const payload = getPayload(testChannel);

        // # Post the webhook message
        cy.postIncomingWebhook({url: incomingWebhook.url, data: payload});

        // * Assert that the message was posted
        cy.uiWaitUntilMessagePostedIncludes('Hey attachments').then(() => {
            cy.getLastPostId().then(() => {
                // * Assert that file image is present
                cy.findByLabelText('file thumbnail').should('be.visible').and('have.attr', 'src', url);

                // * Assert that the Show More button is visible
                cy.get('#showMoreButton').should('be.visible').and('have.text', 'Show more').click().then(() => {
                    // * Assert that the Show less button is visible after Show more is clicked
                    cy.get('#post-list');
                    cy.get('#showMoreButton').scrollIntoView().should('have.text', 'Show less');
                });
            });
        });
    });
});

const url = 'http://localhost:8065/api/v4/image?url=http%3A%2F%2Fvia.placeholder.com%2F300.png%3Fexpires%3D213134234234234234234234%26signature%3Dlksdfljkasdflkjdflknsdlknsdfljksefkjesdflknsdflknsdflknsefjkwerflkneflnsdflknsdflnksdlvnsdlvnsdvnsdvnelfkjnelfknsdvnsdflnvsdflkseflmgsdflmvsdmfnvsdfvsdfvsdfv-sdfsdflkmsdflkmsdflksdflmsdflsdlfk~msdflmsdflsdfsdffgfg%26something%3Dlksdfljkasdflkjdflknsdlknsdfljksefkjesdflknsdflknsdflknsefjkwerflkneflnsdflknsdflnksdlvnsdlvnsdvnsdvnelfkjnelfknsdvnsdflnvsdflkseflmgsdflmvsdmfnvsdfvsdfvsdfv-sdfsdflkmsdflkmsdflksdflmsdflsdlfk~msdflmsdflsdfsdffgfg%26anything%3Dlksdfljkasdflkjdflknsdlknsdfljksefkjesdflknsdflknsdflknsefjkwerflkneflnsdflknsdflnksdlvnsdlvnsdvnsdvnelfkjnelfknsdvnsdflnvsdflkseflmgsdflmvsdmfnvsdfvsdfvsdfv-sdfsdflkmsdflkmsdflksdflmsdflsdlfk~msdflmsdflsdfsdffgfg%26a%3Dlksdfljkasdflkjdflknsdlknsdfljksefkjesdflknsdflknsdflknsefjkwerflkneflnsdflknsdflnksdlvnsdlvnsdvnsdvnelfkjnelfknsdvnsdflnvsdflkseflmgsdflmvsdmfnvsdfvsdfvsdfv-sdfsdflkmsdflkmsdflksdflmsdflsdlfk~msdflmsdflsdfsdffgfg%26b%3Dlksdfljkasdflkjdflknsdlknsdfljksefkjesdflknsdflknsdflknsefjkwerflkneflnsdflknsdflnksdlvnsdlvnsdvnsdvnelfkjnelfknsdvnsdflnvsdflkseflmgsdflmvsdmfnvsdfvsdfvsdfv-sdfsdflkmsdflkmsdflksdflmsdflsdlfk~msdflmsdflsdfsdffgfg%26c%3Dlksdfljkasdflkjdflknsdlknsdfljksefkjesdflknsdflknsdflknsefjkwerflkneflnsdflknsdflnksdlvnsdlvnsdvnsdvnelfkjnelfknsdvnsdflnvsdflkseflmgsdflmvsdmfnvsdfvsdfvsdfv-sdfsdflkmsdflkmsdflksdflmsdflsdlfk~msdflmsdflsdfsdffgfg%26d%3Dlksdfljkasdflkjdflknsdlknsdfljksefkjesdflknsdflknsdflknsefjkwerflkneflnsdflknsdflnksdlvnsdlvnsdvnsdvnelfkjnelfknsdvnsdflnvsdflkseflmgsdflmvsdmfnvsdfvsdfvsdfv-sdfsdflkmsdflkmsdflksdflmsdflsdlfk~msdflmsdflsdfsdffgfg%26f%3Dlksdfljkasdflkjdflknsdlknsdfljksefkjesdflknsdflknsdflknsefjkwerflkneflnsdflknsdflnksdlvnsdlvnsdvnsdvnelfkjnelfknsdvnsdflnvsdflkseflmgsdflmvsdmfnvsdfvsdfvsdfv-sdfsdflkmsdflkmsdflksdflmsdflsdlfk~msdflmsdflsdfsdffgfg%26g%3Dlksdfljkasdflkjdflknsdlknsdfljksefkjesdflknsdflknsdflknsefjkwerflkneflnsdflknsdflnksdlvnsdlvnsdvnsdvnelfkjnelfknsdvnsdflnvsdflkseflmgsdflmvsdmfnvsdfvsdfvsdfv-sdfsdflkmsdflkmsdflksdflmsdflsdlfk~msdflmsdflsdfsdffgfg%26h%3Dlksdfljkasdflkjdflknsdlknsdfljksefkjesdflknsdflknsdflknsefjkwerflkneflnsdflknsdflnksdlvnsdlvnsdvnsdvnelfkjnelfknsdvnsdflnvsdflkseflmgsdflmvsdmfnvsdfvsdfvsdfv-sdfsdflkmsdflkmsdflksdflmsdflsdlfk~msdflmsdflsdfsdffgfg%26i%3Dlksdfljkasdflkjdflknsdlknsdfljksefkjesdflknsdflknsdflknsefjkwerflkneflnsdflknsdflnksdlvnsdlvnsdvnsdvnelfkjnelfknsdvnsdflnvsdflkseflmgsdflmvsdmfnvsdfvsdfvsdfv-sdfsdflkmsdflkmsdflksdflmsdflsdlfk~msdflmsdflsdfsdffgfg';
const text = '). Lorem ipsum dolor sit amet, mea invenire petentium intellegat et, ex meis admodum pro, eirmod indoctum eloquentiam an sea. Choro quando duo eu, epicuri postulant sit ad. Sea aperiam consetetur no, mei facete labitur omnesque an, no duo oblique suavitate referrentur. Doming lucilius recteque ea mei, ne pri causae civibus iudicabit, et usu nobis eruditi praesent. Augue denique pertinacia no his, pro lorem detraxit liberavisse ad. Vis in alii adhuc incorrupte, et duo omittam dignissim, adhuc possim mea at. Etiam vidisse eum cu, porro putent conceptam his ei. Vis et erat malis nobis, mea ad veritus civibus suscipiantur. Ridens quodsi veritus ut vix, noluisse assueverit concludaturque cum eu. Usu scripta malorum perfecto ea, eu aperiam recteque vulputate mei, quo ut volumus indoctum. Omnis semper doctus mei in, ut vidit placerat vix. Amet magna meliore vix eu, nostrud aliquid nec no. Audiam lucilius mel ut, nobis dignissim pro ea. Cu vim melius antiopam. Quo no prima inani persius. Ius et diam nibh nostro, ius ad enim consulatu adversarium. His at percipit liberavisse. An debitis scribentur nec, eum veri habemus constituam in, eos probo inciderint id. An quo putant everti albucius, option scriptorem id est. Pri cu hinc utamur vulputate. His ut aeterno facilis partiendo. Mutat harum posidonium eos ad, mei utamur posidonium ex. At recusabo abhorreant has, vel te animal honestatis, his ad aperiam noluisse. Eu virtute utroque qui. His omnes sadipscing ad, ad sea harum sanctus tractatos, per ad possim platonem. Pro ei propriae molestie, affert rationibus no pri, his eu elit dolores accusamus. Mea mollis persius no. Nobis voluptatibus et mea, mea natum electram voluptatibus an. At quas populo mei, latine malorum equidem vim te, eu eos salutatus dignissim theophrastus. Sit at quem mandamus salutandi, at dicat assueverit disputando nec. Per quis veniam aliquam ne, omnesque appellantur eam no. Te quod omnium phaedrum mei, et mel alii saepe torquatos. Eu fuisset deseruisse sea. Eum mucius denique ut. Mazim eirmod scaevola mei ea, nemore eirmod persequeris an sit, vim et tota commodo labores. Novum affert fierent ut sea, ne meliore adipiscing quaerendum quo, lorem labitur pri ad. Has mutat reque consulatu et, dicat dissentias vim ne. Putent neglegentur et est. Oblique accumsan dissentiunt usu ut, ei mea decore doctus temporibus. Incorrupte delicatissimi mea cu. Te modo persecuti usu, eos eu ridens virtute. Posse postea prompta nam ex. Ex eam magna sensibus conclusionemque, has an nostrud ullamcorper, ei porro soleat sea. Eu eam sumo exerci bonorum, cu postea iuvaret nostrum vel. Duo no adipisci disputando, adipisci petentium id his, qui ceteros dignissim in. Veri mucius detraxit cu pri, epicurei disputando no duo. Est vidit labore fabellas eu, an feugait gloriatur per, errem eirmod salutatus ad usu. Cu usu rebum graeci voluptua, qui meis concludaturque cu. Nam appareat scaevola philosophia eu, duo in veri ullum dignissim. An fabellas delicata accusamus pri, clita commodo cu his, nonumes copiosae legendos ne est. Vix ea mucius epicurei democritum, erat atomorum quo ei. Nam hinc illum mediocrem in. His ne fugit voluptatum, te quo facilisi senserit. Oblique accumsan dissentiunt usu ut, ei mea decore doctus temporibus. Incorrupte delicatissimi mea cu. Te modo persecuti usu, eos eu ridens virtute. Posse postea prompta nam ex. Ex eam magna sensibus conclusionemque, has an nostrud ullamcorper, ei porro soleat sea. Eu eam sumo exerci bonorum, cu postea iuvaret nostrum vel. Duo no adipisci disputando, adipisci petentium id his, qui ceteros dignissim in. Veri mucius detraxit cu pri, epicurei disputando no duo. Est vidit labore fabellas eu, an feugait gloriatur per, errem eirmod salutatus ad usu. Cu usu rebum graeci voluptua, qui meis concludaturque cu. Nam appareat scaevola philosophia eu, duo in veri ullum dignissim. An fabellas delicata accusamus pri, clita commodo cu his, nonumes copiosae legendos ne est. Vix ea mucius epicurei democritum, erat atomorum quo ei. Nam hinc illum mediocrem in. His ne fugit voluptatum, te quo facilisi senserit.';

function getPayload(testChannel) {
    return {
        channel: testChannel.name,
        text: `Hey attachments ![graph](${url})${text}`,
    };
}
