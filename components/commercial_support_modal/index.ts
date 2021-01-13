// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';

import {GlobalState} from 'types/store';

import CommercialSupportModal from './commercial_support_modal';

function mapStateToProps(state: GlobalState) {
    const modalId = ModalIdentifiers.COMMERCIAL_SUPPORT;
    const config = getConfig(state);
    const showBannerWarning = config.EnableFile !== 'true' || config.FileLevel !== 'DEBUG';

    return {
        show: isModalOpen(state, modalId),
        showBannerWarning,
    };
}

export default connect(mapStateToProps)(CommercialSupportModal);
