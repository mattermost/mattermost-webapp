// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';

import {GlobalState} from 'types/store';

import CommercialSupportModal from './commercial_support_modal';

function mapStateToProps(state: GlobalState) {
    const modalId = ModalIdentifiers.COMMERCIAL_SUPPORT;
    return {
        show: isModalOpen(state, modalId),
    };
}

export default connect(mapStateToProps)(CommercialSupportModal);
