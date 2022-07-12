import {TeamsState} from '@mattermost/types/teams';
import {Team} from '@mattermost/types/teams';
export const emptyTeam: () => Team = () => ({
    id: '',
    create_at: 0,
    update_at: 0,
    delete_at: 0,
    display_name: '',
    name: '',
    description: '',
    email: '',
    type: 'O',
    company_name: '',
    allowed_domains: '',
    invite_id: '',
    allow_open_invite: false,
    scheme_id: '',
    group_constrained: false,
});

export const emptyTeams: () => TeamsState = () => ({
    currentTeamId: 'current_team_id',
    teams: {
        current_team_id: emptyTeam(),
    },
    myMembers: {},
    membersInTeam: {},
    stats: {},
    groupsAssociatedToTeam: {},
    totalCount: 0,
});
