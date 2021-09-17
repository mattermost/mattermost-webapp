// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {Team} from 'mattermost-redux/types/teams';
import {UserProfile} from 'mattermost-redux/types/users';
import {GlobalState} from 'mattermost-redux/types/store';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import {getProfilesNotInTeam, searchProfiles} from 'mattermost-redux/actions/users';

import {Filters, getProfilesNotInTeam as selectProfilesNotInTeam} from 'mattermost-redux/selectors/entities/users';

import AddUsersToTeamModal from './add_users_to_team_modal';

type Props = {
    team: Team;
    filterExcludeGuests?: boolean;
};

type Actions = {
    getProfilesNotInTeam: (teamId: string, groupConstrained: boolean, page: number, perPage?: number) => Promise<{ data: UserProfile[] }>;
    searchProfiles: (term: string, options?: any) => Promise<{ data: UserProfile[] }>;
};

const dontExcludeGuestsFilter = {active: true};
const excludeGuestsFilter = {role: 'system_user', ...dontExcludeGuestsFilter};

function mapStateToProps(state: GlobalState, props: Props) {
    const {id: teamId} = props.team;

    let filterOptions: Filters = dontExcludeGuestsFilter;
    if (props.filterExcludeGuests) {
        filterOptions = excludeGuestsFilter;
    }

    const users: UserProfile[] = selectProfilesNotInTeam(state, teamId, filterOptions);

    return {
        users,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getProfilesNotInTeam,
            searchProfiles,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddUsersToTeamModal);
