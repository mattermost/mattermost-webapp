// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {Action, ActionResult} from 'mattermost-redux/types/actions';
import {getStandardAnalytics, sendWarnMetricAck} from 'mattermost-redux/actions/admin';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

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
        telemetryId: config.DiagnosticId,
        show: isModalOpen(state, ModalIdentifiers.WARN_METRIC_ACK),
        closeParentComponent: ownProps.closeParentComponent,
    };
}

type Actions = {
    closeModal: (modalId: string) => void;
    getStandardAnalytics: () => void;
    sendWarnMetricAck: (warnMetricId: string, forceAck: boolean) => Promise<ActionResult>;
};

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>(
            {
                closeModal,
                getStandardAnalytics,
                sendWarnMetricAck,
            },
            dispatch,
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(WarnMetricAckModal);
