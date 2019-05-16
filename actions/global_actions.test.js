// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {browserHistory} from 'utils/browser_history';
import {closeRightHandSide, closeMenu as closeRhsMenu} from 'actions/views/rhs';
import {close as closeLhs} from 'actions/views/lhs';

import {redirectUserToDefaultTeam, toggleSideBarRightMenuAction} from 'actions/global_actions.jsx';

jest.mock('actions/views/rhs', () => ({
    closeMenu: jest.fn(),
    closeRightHandSide: jest.fn(),
}));

jest.mock('actions/views/lhs', () => ({
    close: jest.fn(),
}));

jest.mock('mattermost-redux/actions/users', () => ({
    loadMe: () => ({type: 'MOCK_RECEIVED_ME'}),
}));

describe('actions/global_actions', () => {
    test('redirectUserToDefaultTeam', async () => {
        browserHistory.push = jest.fn();
        await redirectUserToDefaultTeam();
        expect(browserHistory.push).toHaveBeenCalledWith('/select_team');
    });

    test('toggleSideBarRightMenuAction', () => {
        const dispatchMock = () => {};
        toggleSideBarRightMenuAction()(dispatchMock);
        expect(closeRhsMenu).toHaveBeenCalled();
        expect(closeRightHandSide).toHaveBeenCalled();
        expect(closeLhs).toHaveBeenCalled();
    });
});
