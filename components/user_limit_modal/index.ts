// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import {isAdmin} from 'utils/utils.jsx';
import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import {closeModal, openModal} from 'actions/views/modals';

import UserLimitModal from './user_limit_modal';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    return {
        userIsAdmin: isAdmin(getCurrentUser(state).roles),
        show: isModalOpen(state, ModalIdentifiers.UPGRADE_CLOUD_ACCOUNT),
        cloudUserLimit: config.ExperimentalCloudUserLimit || '10',
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
