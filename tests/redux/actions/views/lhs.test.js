
import {initTeamChangeActions} from 'actions/views/lhs';
import {loadProfilesForSidebar} from 'actions/user_actions.jsx';
import {loadStatusesForChannelAndSidebar} from 'actions/status_actions.jsx';

jest.mock('actions/status_actions.jsx', () => ({
    loadStatusesForChannelAndSidebar: jest.fn(),
}));

jest.mock('actions/user_actions.jsx', () => ({
    loadProfilesForSidebar: jest.fn(),
}));

it('Check for sidebar init actions', async () => {
    await initTeamChangeActions();
    expect(loadStatusesForChannelAndSidebar).toHaveBeenCalled();
    expect(loadProfilesForSidebar).toHaveBeenCalled();
});
