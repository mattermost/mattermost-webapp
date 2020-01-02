// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {GlobalState} from 'mattermost-redux/types/store';

import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';
import {openModal} from 'actions/views/modals';

import TeamMembersModal from './team_members_modal';

function mapStateToProps(state: GlobalState) {
    const modalId = ModalIdentifiers.TEAM_MEMBERS;
    return {
        currentTeam: getCurrentTeam(state),
        show: isModalOpen(state, modalId),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamMembersModal);
