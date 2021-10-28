// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {withRouter} from 'react-router-dom';

import {getTeams} from 'mattermost-redux/actions/teams';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {
    getCurrentTeamId,
    getJoinableTeamIds,
    getMyTeams,
    getTeamMemberships,
} from 'mattermost-redux/selectors/entities/teams';
import {get, isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {ClientConfig} from 'mattermost-redux/types/config';

import {GenericAction} from 'mattermost-redux/types/actions';

import {getCurrentLocale} from 'selectors/i18n';
import {getIsLhsOpen} from 'selectors/lhs';
import {switchTeam, updateTeamsOrderForUser} from 'actions/team_actions.jsx';
import {Preferences} from 'utils/constants.jsx';
import {GlobalState} from 'types/store';

import {getThreadCounts} from 'mattermost-redux/selectors/entities/threads';

import {getCurrentProduct} from '../../selectors/products';

import TeamSidebar, {Props as TeamSidebarProps} from './team_sidebar';

function mapStateToProps(state: GlobalState, props: TeamSidebarProps) {
    const config: Partial<ClientConfig> = getConfig(state);

    const experimentalPrimaryTeam: string | undefined = config.ExperimentalPrimaryTeam;
    const joinableTeams: string[] = getJoinableTeamIds(state);
    const moreTeamsToJoin: boolean = joinableTeams && joinableTeams.length > 0;
    const currentProduct = getCurrentProduct(state, props.location);

    return {
        currentTeamId: getCurrentTeamId(state),
        myTeams: getMyTeams(state),
        myTeamMembers: getTeamMemberships(state),
        isOpen: getIsLhsOpen(state),
        collapsedThreads: isCollapsedThreadsEnabled(state),
        experimentalPrimaryTeam,
        locale: getCurrentLocale(state),
        moreTeamsToJoin,
        userTeamsOrderPreference: get(state, Preferences.TEAMS_ORDER, '', ''),
        threadCounts: getThreadCounts(state),
        currentProduct,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getTeams,
            switchTeam,
            updateTeamsOrderForUser,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TeamSidebar));
