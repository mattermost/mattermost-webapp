// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {PreferenceType} from '@mattermost/types/preferences';

import useGetTotalUsersNoBots from 'components/common/hooks/useGetTotalUsersNoBots';

import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {savePreferences} from 'mattermost-redux/actions/preferences';

import {openModal} from 'actions/views/modals';
import {GlobalState} from 'types/store';

import {
    Preferences,
    Constants,
    TELEMETRY_CATEGORIES,
    ModalIdentifiers,
} from 'utils/constants';

import StartTrialModal from 'components/start_trial_modal';

import {trackEvent} from 'actions/telemetry_actions';
import {isModalOpen} from 'selectors/views/modals';

const ShowStartTrialModal = () => {
    const isUserAdmin = useSelector((state: GlobalState) => isCurrentUserSystemAdmin(state));

    const dispatch = useDispatch<DispatchFunc>();
    const getCategory = makeGetCategory();

    const userThreshold = 10;
    const TRUE = 'true';

    const isBenefitsModalOpened = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.TRIAL_BENEFITS_MODAL));

    const installationDate = useSelector((state: GlobalState) => getConfig(state).InstallationDate);
    const currentUser = useSelector((state: GlobalState) => getCurrentUser(state));
    const preferences = useSelector<GlobalState, PreferenceType[]>((state) => getCategory(state, Preferences.START_TRIAL_MODAL));

    const prevTrialLicense = useSelector((state: GlobalState) => state.entities.admin.prevTrialLicense);
    const currentLicense = useSelector(getLicense);
    const isLicensed = (license: any) => {
        if (!license?.IsLicensed) {
            return false;
        }
        return license.IsLicensed === TRUE;
    };
    const isPrevLicensed = isLicensed(prevTrialLicense);
    const isCurrentLicensed = isLicensed(currentLicense);
    const totalUsers = useGetTotalUsersNoBots(true);

    // Show this modal if the instance is currently not licensed and has never had a trial license loaded before
    const isLicensedOrPreviousLicensed = (isCurrentLicensed || isPrevLicensed);

    const handleOnClose = () => {
        trackEvent(
            TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_AUTO_MODAL,
            'close_start_trial_auto_modal',
        );
        dispatch(savePreferences(currentUser.id, [
            {
                category: Preferences.START_TRIAL_MODAL,
                user_id: currentUser.id,
                name: Constants.TRIAL_MODAL_AUTO_SHOWN,
                value: TRUE,
            },
        ]));
    };

    useEffect(() => {
        const installationDatePlus6Hours = (6 * 60 * 60 * 1000) + Number(installationDate);
        const now = new Date().getTime();
        const hasEnvMoreThan6Hours = now > installationDatePlus6Hours;
        const hasEnvMoreThan10Users = Number(totalUsers) > userThreshold;
        const hadAdminDismissedModal = preferences.some((pref: PreferenceType) => pref.name === Constants.TRIAL_MODAL_AUTO_SHOWN && pref.value === TRUE);
        if (isUserAdmin && !isBenefitsModalOpened && hasEnvMoreThan10Users && hasEnvMoreThan6Hours && !hadAdminDismissedModal && !isLicensedOrPreviousLicensed) {
            dispatch(openModal({
                modalId: ModalIdentifiers.START_TRIAL_MODAL,
                dialogType: StartTrialModal,
                dialogProps: {onClose: handleOnClose},
            }));
            trackEvent(
                TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_AUTO_MODAL,
                'trigger_start_trial_auto_modal',
            );
        }
    }, [totalUsers]);

    return null;
};
export default ShowStartTrialModal;
