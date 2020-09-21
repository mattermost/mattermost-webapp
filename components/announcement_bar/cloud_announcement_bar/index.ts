// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getUserAudits} from 'mattermost-redux/actions/users';

import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {GenericAction} from 'mattermost-redux/types/actions';
import {getMyTeamMember} from 'mattermost-redux/selectors/entities/teams';

import {isAdmin} from 'utils/utils.jsx';

import {GlobalState} from 'types/store';

import CloudAnnouncementBar from './cloud_announcement_bar';

type OwnProps = {
    currentTeamId: string;
};

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    return {
        userLimit: getConfig(state).ExperimentalCloudUserLimit,
        currentUsers: state.entities.admin.analytics!.TOTAL_USERS,
        userIsAdmin: isAdmin(getMyTeamMember(state, ownProps.currentTeamId).roles),
        isCloud: getLicense(state).Cloud === 'true',
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators(
            {
                getUserAudits,
            },
            dispatch,
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CloudAnnouncementBar);
