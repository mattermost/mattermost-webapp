// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch } from 'redux';

import {Action} from 'mattermost-redux/types/actions';

import {openModal, closeModal} from 'actions/views/modals';
import {ModalData} from 'types/actions';
import {GlobalState} from 'types/store';

import SharedMessage from './shared_message';

function mapStateToProps(state: GlobalState) {
    /* TODO */

}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>({
            openModal,
            closeModal,
        }, dispatch),
    };
}

type Actions = {
    openModal: <P>(modalData: ModalData<P>) => void;
    closeModal: (modalId: string) => void;
}

export default connect(mapStateToProps, mapDispatchToProps)(SharedMessage);
