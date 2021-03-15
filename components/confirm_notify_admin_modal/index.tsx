// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import {closeModal} from 'actions/views/modals';
import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import ConfirmNotifyAdminModal from './confirm_notify_admin_modal';

function mapStateToProps(state: GlobalState) {
    return {
        show: isModalOpen(state, ModalIdentifiers.CONFIRM_NOTIFY_ADMIN),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators(
            {
                closeModal: () => closeModal(ModalIdentifiers.CONFIRM_NOTIFY_ADMIN),
            },
            dispatch,
        ),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ConfirmNotifyAdminModal);
