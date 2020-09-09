// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import {closeModal} from 'actions/views/modals';
import {getProductPrice, completeStripeAddPaymentMethod} from 'actions/cloud';

import PurchaseModal from './purchase_modal';

function mapStateToProps(state) {
    return {
        show: isModalOpen(state, ModalIdentifiers.CLOUD_PURCHASE),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeModal: () => closeModal(ModalIdentifiers.CLOUD_PURCHASE),
            getProductPrice,
            completeStripeAddPaymentMethod,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseModal);
