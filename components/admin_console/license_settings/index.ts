// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import withGetCloudSubscription from 'components/common/hocs/cloud/with_get_cloud_subscription';

import {getLicenseConfig} from 'mattermost-redux/actions/general';
import {StatusOK} from '@mattermost/types/client4';
import {Action, ActionResult, GenericAction} from 'mattermost-redux/types/actions';
import {uploadLicense, removeLicense, getPrevTrialLicense} from 'mattermost-redux/actions/admin';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'types/store';
import {ModalData} from 'types/actions';

import {openModal} from 'actions/views/modals';

import {requestTrialLicense, upgradeToE0Status, upgradeToE0, restartServer, ping} from 'actions/admin_actions';

import LicenseSettings from './license_settings';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const license = getLicense(state);
    const subscription = state.entities.cloud.subscription;
    const isCloud = license.Cloud === 'true';
    const isFreeTrial = subscription?.is_free_trial === 'true';

    return {
        stats: state.entities.admin.analytics,
        upgradedFromTE: config.UpgradedFromTE === 'true',
        prevTrialLicense: state.entities.admin.prevTrialLicense,
        isCloud,
        isFreeTrial,
        trialEndDate: subscription?.trial_end_at || 0,
    };
}

type StatusOKFunc = () => Promise<StatusOK>;
type PromiseStatusFunc = () => Promise<{status: string}>;
type ActionCreatorTypes = Action | PromiseStatusFunc | StatusOKFunc;

type Actions = {
    getLicenseConfig: () => void;
    uploadLicense: (file: File) => Promise<ActionResult>;
    removeLicense: () => Promise<ActionResult>;
    getPrevTrialLicense: () => void;
    upgradeToE0: StatusOKFunc;
    upgradeToE0Status: () => Promise<{percentage: number; error: string | JSX.Element}>;
    restartServer: StatusOKFunc;
    ping: PromiseStatusFunc;
    requestTrialLicense: (users: number, termsAccepted: boolean, receiveEmailsAccepted: boolean, featureName: string) => Promise<ActionResult>;
    openModal: <P>(modalData: ModalData<P>) => void;

}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionCreatorTypes>, Actions>({
            getLicenseConfig,
            uploadLicense,
            removeLicense,
            getPrevTrialLicense,
            upgradeToE0,
            upgradeToE0Status,
            restartServer,
            ping,
            requestTrialLicense,
            openModal,
        }, dispatch),
    };
}

export default withGetCloudSubscription(connect(mapStateToProps, mapDispatchToProps)(LicenseSettings));
