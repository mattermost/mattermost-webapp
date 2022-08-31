// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {GenericAction} from 'mattermost-redux/types/actions';
import {getCloudSubscription} from 'mattermost-redux/actions/cloud';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';
import {closeModal, openModal} from 'actions/views/modals';

import DeliquencyModalController from './deliquency_modal_controller';

function mapStateToProps(state: GlobalState) {
    const license = getLicense(state);
    const isCloud = license.Cloud === 'true';
    const subscription = state.entities.cloud?.subscription;
    const userIsAdmin = isCurrentUserSystemAdmin(state);

    return {
        isCloud,
        subscription,
        userIsAdmin,
        show: isModalOpen(state, ModalIdentifiers.DELIQUENCY_MODAL_DOWNGRADE),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getCloudSubscription,
            closeModal: () => closeModal(ModalIdentifiers.DELIQUENCY_MODAL_DOWNGRADE),
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeliquencyModalController);
