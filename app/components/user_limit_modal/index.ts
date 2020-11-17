// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getMyTeamMember} from 'mattermost-redux/selectors/entities/teams';

import {bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import {isAdmin} from 'utils/utils.jsx';
import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import {closeModal, openModal} from 'actions/views/modals';

import UserLimitModal from './user_limit_modal';

type OwnProps = {
    currentTeamId: string;
};

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    return {
        userLimit: getConfig(state).ExperimentalCloudUserLimit,
        currentUsers: state.entities.admin.analytics!.TOTAL_USERS,
        userIsAdmin: isAdmin(
            getMyTeamMember(state, ownProps.currentTeamId).roles,
        ),
        show: isModalOpen(state, ModalIdentifiers.UPGRADE_CLOUD_ACCOUNT),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators(
            {
                closeModal: () => closeModal(ModalIdentifiers.UPGRADE_CLOUD_ACCOUNT),
                openModal: (modalData) => openModal(modalData),
            },
            dispatch,
        ),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(UserLimitModal);
