// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import withGetCloudSubscription from 'components/common/hocs/cloud/with_get_cloud_subscription';

import {getLicenseConfig} from 'mattermost-redux/actions/general';
import {getPrevTrialLicense} from 'mattermost-redux/actions/admin';
import {Action, GenericAction} from 'mattermost-redux/types/actions';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {isCloudLicense} from 'utils/license_utils';

import {checkHadPriorTrial} from 'mattermost-redux/selectors/entities/cloud';
import {getCloudSubscription} from 'mattermost-redux/actions/cloud';
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
    const hasPriorTrial = checkHadPriorTrial(state);
    const isCloudTrial = subscription?.is_free_trial === 'true';
    return {
        stats: state.entities.admin.analytics,
        prevTrialLicense: state.entities.admin.prevTrialLicense,
        isCloud,
        isCloudTrial,
        isSubscriptionLoaded: subscription !== undefined,
        hadPrevCloudTrial: hasPriorTrial,
        isPaidSubscription: isCloud && license?.SkuShortName !== LicenseSkus.Starter && !isCloudTrial,
    };
}

type Actions = {
    requestTrialLicense: () => Promise<{error?: string; data?: null}>;
    getLicenseConfig: () => void;
    getPrevTrialLicense: () => void;
    getCloudSubscription: () => void;
    openModal: <P>(modalData: ModalData<P>) => void;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>({
            requestTrialLicense,
            getLicenseConfig,
            getPrevTrialLicense,
            getCloudSubscription,
            openModal,
        }, dispatch),
    };
}

export default withGetCloudSubscription(connect(mapStateToProps, mapDispatchToProps)(FeatureDiscovery));
