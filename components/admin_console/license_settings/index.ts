// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getLicenseConfig} from 'mattermost-redux/actions/general';
import {StatusOK} from 'mattermost-redux/types/client4';
import {Action, ActionResult, GenericAction} from 'mattermost-redux/types/actions';
import {uploadLicense, removeLicense, getPrevTrialLicense} from 'mattermost-redux/actions/admin';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'types/store';
import {ModalData} from 'types/actions';

import {openModal} from 'actions/views/modals';

import {requestTrialLicense, upgradeToE0Status, upgradeToE0, restartServer, ping} from 'actions/admin_actions';

import LicenseSettings from './license_settings';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    return {
        stats: state.entities.admin.analytics,
        upgradedFromTE: config.UpgradedFromTE === 'true',
        prevTrialLicense: state.entities.admin.prevTrialLicense,
    };
}

type Actions = {
    getLicenseConfig: () => void;
    uploadLicense: (file: File) => Promise<ActionResult>;
    removeLicense: () => Promise<ActionResult>;
    getPrevTrialLicense: () => void;
    upgradeToE0: () => Promise<StatusOK>;
    upgradeToE0Status: () => Promise<ActionResult>;
    restartServer: () => Promise<StatusOK>;
    ping: () => Promise<{status: string}>;
    requestTrialLicense: (users: number, termsAccepted: boolean, receiveEmailsAccepted: boolean, featureName: string) => Promise<ActionResult>;
    openModal: <P>(modalData: ModalData<P>) => void;

}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>({
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

export default connect(mapStateToProps, mapDispatchToProps)(LicenseSettings);
