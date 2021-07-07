// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {getLicenseConfig} from 'mattermost-redux/actions/general';
import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {getPrevTrialLicense} from 'mattermost-redux/actions/admin';

import {requestTrialLicense} from 'actions/admin_actions';

import {GlobalState} from 'types/store';

import FeatureDiscovery from './feature_discovery';

function mapStateToProps(state: GlobalState) {
    return {
        stats: state.entities.admin.analytics,
        prevTrialLicense: state.entities.admin.prevTrialLicense,
    };
}

type Actions = {
    requestTrialLicense: () => Promise<{error?: string; data?: null}>;
    getLicenseConfig: () => void;
    getPrevTrialLicense: () => void;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            requestTrialLicense,
            getLicenseConfig,
            getPrevTrialLicense,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FeatureDiscovery);
