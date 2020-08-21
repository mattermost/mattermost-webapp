// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getMyTeamMember} from 'mattermost-redux/selectors/entities/teams';

import {GlobalState} from 'types/store';

import {isAdmin} from 'utils/utils.jsx';

import UserLimitModal from './user_limit_modal';

type OwnProps = {
    currentTeamId: string;
};

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    return {
        userLimit: getConfig(state).ExperimentalCloudUserLimit,
        currentUsers: state.entities.admin.analytics!.TOTAL_USERS,
        userIsAdmin: isAdmin(getMyTeamMember(state, ownProps.currentTeamId).roles),
        onClose: () => {
            console.log('close');
        },
        onSubmit: () => {
            console.log('Submit');
        },
        show: true,
    };
}

export default connect(mapStateToProps)(UserLimitModal);
