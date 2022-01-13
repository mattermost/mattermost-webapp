// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const getConfig = (actions) => ({
    includeWarnings: true,
    timeout: 30000,
    standard: 'WCAG2A',
    runners: ['axe', 'htmlcs'],
    actions: Array.isArray(actions) ? actions : [],
});

const loginAsUser = () => [
    'wait for path to be /login',
    'set field #loginId to michel.engelen@mattermost.com',
    'set field #loginPassword to tkm3png@yce*EUJ2rnz',
    'click element #loginButton',
];

const actionSets = {
    loginAsUser,
};

const usePa11yHelper = (team, route = '') => {
    const state = {
        team,
        route,
    };

    const navigateToTeam = (_team) => {
        state.team = _team;
        state.route = '';

        return [`navigate to /${state.team}`];
    };

    const navigateToRoute = (_route) => {
        state.route = _route;

        return [`navigate to /${state.team}/${state.route}`];
    };

    const initialActions = [];
    initialActions.concat(navigateToTeam(team));
    initialActions.concat(navigateToRoute(route));

    return [initialActions, this];
};

export {
    getConfig,
    actionSets,
    usePa11yHelper,
};
