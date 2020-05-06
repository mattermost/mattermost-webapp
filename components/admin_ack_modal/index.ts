// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {sendAdminAck} from 'mattermost-redux/actions/admin';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';
import {getLicense} from 'mattermost-redux/selectors/entities/general';

import {closeModal} from 'actions/views/modals';
import {isModalOpen} from '../../selectors/views/modals';
import {ModalIdentifiers} from '../../utils/constants';

import AdminAckModal from './admin_ack_modal';

type Props = {
    closeParentComponent: () => Promise<void>;
};

function mapStateToProps(state: GlobalState, ownProps: Props) {
    return {
        user: getCurrentUser(state),
        license: getLicense(state),
        show: isModalOpen(state, ModalIdentifiers.ADMIN_ACK),
        closeParentComponent: ownProps.closeParentComponent,
    };
}

type Actions = {
    sendAdminAck: () => ActionFunc & Partial<{error: Error}>;
    closeModal: (arg0: string) => void;
};

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>(
            {
                sendAdminAck,
                closeModal,
            },
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminAckModal);
