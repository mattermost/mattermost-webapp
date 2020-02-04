// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {GlobalState} from 'mattermost-redux/types/store';

import {getProfilesInTeam, getTotalUsersStats} from 'mattermost-redux/actions/users';
import {getProfilesInTeam as selectProfiles, getTotalUsersStats as getTotalUsersStatsSelector} from 'mattermost-redux/selectors/entities/users';

import UserGrid from './user_grid';

type Props = {
    teamId: string;
};

type Actions = {
    getProfilesInTeam: (teamId: string, page: number, perPage: number) => Promise<{
        data: boolean;
    }>;
};


function mapStateToProps(state: GlobalState, props: Props) {

    const teamId = props.teamId;
    const users = selectProfiles(state, teamId);
    const {total_users_count: total} = getTotalUsersStatsSelector(state)

    return {
        users,
        total,
    };
}
function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getProfilesInTeam,
            getTotalUsersStats,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserGrid);
