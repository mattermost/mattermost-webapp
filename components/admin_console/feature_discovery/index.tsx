// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {getLicenseConfig} from 'mattermost-redux/actions/general';
import {getPrevTrialLicense} from 'mattermost-redux/actions/admin';
import {Action, GenericAction} from 'mattermost-redux/types/actions';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {isCloudLicense} from 'utils/license_utils';

import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {LicenseSkus} from 'mattermost-redux/types/general';

import {openModal} from 'actions/views/modals';
import {requestTrialLicense} from 'actions/admin_actions';

import {ModalData} from 'types/actions';
import {GlobalState} from 'types/store';

import FeatureDiscovery from './feature_discovery';

function mapStateToProps(state: GlobalState) {
    const subscription = state.entities.cloud.subscription;
    const license = getLicense(state);
    const isCloud = isCloudLicense(license);
    const isCloudFreeEnabled = cloudFreeEnabled(state);
    const isCloudTrial = subscription?.is_free_trial === 'true';
    return {
        stats: state.entities.admin.analytics,
        prevTrialLicense: state.entities.admin.prevTrialLicense,
        isCloud,
        isCloudFreeEnabled,
        isCloudTrial,
        hadPrevCloudTrial: subscription?.is_free_trial === 'false' && subscription?.trial_end_at > 0,
        isCloudFreePaidSubscription: isCloud && isCloudFreeEnabled && license?.SkuShortName !== LicenseSkus.Starter && !isCloudTrial,
    };
}

type Actions = {
    requestTrialLicense: () => Promise<{error?: string; data?: null}>;
    getLicenseConfig: () => void;
    getPrevTrialLicense: () => void;
    openModal: <P>(modalData: ModalData<P>) => void;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>({
            requestTrialLicense,
            getLicenseConfig,
            getPrevTrialLicense,
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FeatureDiscovery);
