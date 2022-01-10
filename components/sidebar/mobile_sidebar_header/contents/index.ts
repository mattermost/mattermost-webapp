// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {GenericAction} from 'mattermost-redux/types/actions';

import {openModal} from 'actions/views/modals';

import Contents from './contents';

function mapStateToProps(state: GlobalState) {
    const currentTeam = getCurrentTeam(state);
    const currentUser = getCurrentUser(state);

    return {
        currentUser,
        teamDescription: currentTeam.description,
        teamDisplayName: currentTeam.display_name,
        teamId: currentTeam.id,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Contents);
