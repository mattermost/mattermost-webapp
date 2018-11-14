// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {browserHistory} from 'utils/browser_history';

import {redirectUserToDefaultTeam} from 'actions/global_actions.jsx';

describe('actions/global_actions', () => {
    test('redirectUserToDefaultTeam', async () => {
        browserHistory.push = jest.fn();
        await redirectUserToDefaultTeam();
        expect(browserHistory.push).toHaveBeenCalledWith('/select_team');
    });
});
