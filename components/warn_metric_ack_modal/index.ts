// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {getStandardAnalytics, sendWarnMetricAck, requestTrialLicenseAndAckWarnMetric} from 'mattermost-redux/actions/admin';
import {getLicenseConfig} from 'mattermost-redux/actions/general';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import {closeModal} from 'actions/views/modals';

import {isModalOpen} from '../../selectors/views/modals';
import {ModalIdentifiers} from '../../utils/constants';

import WarnMetricAckModal from './warn_metric_ack_modal';

type Props = {
    closeParentComponent: () => Promise<void>;
};

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const config = getConfig(state);

    return {
        stats: state.entities.admin.analytics,
        user: getCurrentUser(state),
        license: getLicense(state),
        diagnosticId: config.DiagnosticId,
        show: isModalOpen(state, ModalIdentifiers.WARN_METRIC_ACK),
        closeParentComponent: ownProps.closeParentComponent,
        enterpriseReady: config.BuildEnterpriseReady === 'true',
    };
}

type Actions = {
    closeModal: (arg: string) => void;
    getStandardAnalytics: () => any;
    sendWarnMetricAck: (arg0: string, arg1: boolean) => ActionFunc & Partial<{error?: string}>;
    requestTrialLicenseAndAckWarnMetric: (arg0: string) => ActionFunc & Partial<{error?: string}>;
    getLicenseConfig: () => void;
};

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>(
            {
                closeModal,
                getStandardAnalytics,
                sendWarnMetricAck,
                requestTrialLicenseAndAckWarnMetric,
                getLicenseConfig,
            },
            dispatch,
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(WarnMetricAckModal);
