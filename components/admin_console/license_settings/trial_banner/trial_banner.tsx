// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {PreferenceType} from 'mattermost-redux/types/preferences';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';

import AlertBanner from 'components/alert_banner';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import {localizeMessage} from 'utils/utils';
import {format} from 'utils/markdown';

import {Preferences, Unique} from 'utils/constants';

import {GlobalState} from 'types/store';
import store from 'stores/redux_store.jsx';

interface TrialBannerProps {
    isDisabled: boolean;
    gettingTrialError: string | null;
    requestLicense: (e?: any, reload?: boolean) => Promise<void>;
    gettingTrial: boolean;
    enterpriseReady: boolean;
    upgradingPercentage: number;
    handleUpgrade: () => Promise<void>;
    upgradeError: string | null;
    restartError: string | null;

    handleRestart: () => Promise<void>;

    openEEModal: any;

    restarting: boolean;
}

const TrialBanner: React.FC<TrialBannerProps> = ({
    isDisabled,
    gettingTrialError,
    requestLicense,
    gettingTrial,
    enterpriseReady,
    upgradingPercentage,
    handleUpgrade,
    upgradeError,
    restartError,
    handleRestart,
    restarting,
    openEEModal,
}: TrialBannerProps) => {
    let trialButton;
    let upgradeTermsMessage;
    let content;
    let gettingTrialErrorMsg;

    const state = store.getState();
    const getCategory = makeGetCategory();
    const preferences = getCategory(state, Preferences.UNIQUE);
    const restartedAfterUpgradePrefValue = preferences.find((pref: PreferenceType) => pref.name === Unique.REQUEST_TRIAL_AFTER_SERVER_UPGRADE);
    const clickedUpgradeAndStartTrialBtn = preferences.find((pref: PreferenceType) => pref.name === Unique.CLICKED_UPGRADE_AND_TRIAL_BTN);

    const restartedAfterUpgradePrefs = restartedAfterUpgradePrefValue?.value === 'true';
    const clickedUpgradeAndTrialBtn = clickedUpgradeAndStartTrialBtn?.value === 'true';

    const userId = useSelector((state: GlobalState) => getCurrentUserId(state));

    const dispatch = useDispatch();

    useEffect(() => {
        async function savePrefsAndRequestTrial() {
            await savePrefsRestartedAfterUpgrade();
            handleRestart();
        }
        if (upgradingPercentage === 100 && clickedUpgradeAndTrialBtn) {
            if (!restarting) {
                savePrefsAndRequestTrial();
            }
        }
    }, [upgradingPercentage, clickedUpgradeAndTrialBtn]);

    useEffect(() => {
        // validating the percentage in 0 we make sure to only remove the prefs value on component load after restart
        if (restartedAfterUpgradePrefs && clickedUpgradeAndTrialBtn && upgradingPercentage === 0) {
            // remove the values from the preferences
            const category = Preferences.UNIQUE;
            const reqLicense = Unique.REQUEST_TRIAL_AFTER_SERVER_UPGRADE;
            const clickedBtn = Unique.CLICKED_UPGRADE_AND_TRIAL_BTN;
            dispatch(savePreferences(userId, [{category, name: reqLicense, user_id: userId, value: ''}, {category, name: clickedBtn, user_id: userId, value: ''}]));

            requestLicense();
        }
    }, [restartedAfterUpgradePrefs, clickedUpgradeAndTrialBtn]);

    const onHandleUpgrade = () => {
        if (!handleUpgrade) {
            return;
        }
        handleUpgrade();
        const category = Preferences.UNIQUE;
        const name = Unique.CLICKED_UPGRADE_AND_TRIAL_BTN;
        dispatch(savePreferences(userId, [{category, name, user_id: userId, value: 'true'}]));
    };

    const savePrefsRestartedAfterUpgrade = () => {
        // save in the preferences that this customer wanted to request trial just after the upgrade
        const category = Preferences.UNIQUE;
        const name = Unique.REQUEST_TRIAL_AFTER_SERVER_UPGRADE;
        dispatch(savePreferences(userId, [{category, name, user_id: userId, value: 'true'}]));
    };

    const eeModalTerms = (
        <a
            role='button'
            onClick={openEEModal}
        >
            <FormattedMarkdownMessage
                id='admin.license.enterprise.upgrade.eeLicenseLink'
                defaultMessage='Enterprise Edition License'
            />
        </a>
    );
    if (enterpriseReady && !restartedAfterUpgradePrefs) {
        gettingTrialErrorMsg = gettingTrialError ? (
            <p className='trial-error'>
                <FormattedMarkdownMessage
                    id='admin.license.trial-request.error'
                    defaultMessage='Trial license could not be retrieved. Visit [https://mattermost.com/trial/](https://mattermost.com/trial/) to request a license.'
                />
            </p>
        ) : null;
        trialButton = (
            <button
                type='button'
                className='btn btn-primary'
                onClick={requestLicense}
                disabled={isDisabled}
            >
                <LoadingWrapper
                    loading={gettingTrial}
                    text={localizeMessage('admin.license.trial-request.loading', 'Getting trial')}
                >
                    <FormattedMessage
                        id='admin.license.trial-request.submit'
                        defaultMessage='Start trial'
                    />
                </LoadingWrapper>
            </button>
        );
        content = (
            <>
                <FormattedMessage
                    id='admin.license.trial-request.title'
                    defaultMessage='Experience Mattermost Enterprise Edition for free for the next 30 days. No obligation to buy or credit card required. '
                />
                <FormattedMarkdownMessage
                    id='admin.license.trial-request.accept-terms'
                    defaultMessage='By clicking **Start trial**, I agree to the [Mattermost Software Evaluation Agreement](!https://mattermost.com/software-evaluation-agreement/), [Privacy Policy](!https://mattermost.com/privacy-policy/), and receiving product emails.'
                />
            </>
        );
        upgradeTermsMessage = null;
    } else {
        gettingTrialErrorMsg = null;
        trialButton = (
            <button
                type='button'
                onClick={onHandleUpgrade}
                className='btn btn-primary'
            >
                <LoadingWrapper
                    loading={upgradingPercentage > 0}
                    text={upgradingPercentage === 100 && restarting ? (
                        <FormattedMessage
                            id='admin.license.enterprise.restarting'
                            defaultMessage='Restarting'
                        />
                    ) : (
                        <FormattedMessage
                            id='admin.license.enterprise.upgrading'
                            defaultMessage='Upgrading {percentage}%'
                            values={{percentage: upgradingPercentage}}
                        />)}
                >
                    <FormattedMessage
                        id='admin.license.trialUpgradeAndRequest.submit'
                        defaultMessage='Upgrade Server And Start trial'
                    />
                </LoadingWrapper>
            </button>
        );

        content = (
            <>
                <FormattedMessage
                    id='admin.license.upgrade-and-trial-request.title'
                    defaultMessage='Upgrade to Enterprise Edition and Experience Mattermost Enterprise Edition for free for the next 30 days. No obligation to buy or credit card required. '
                />
            </>
        );

        upgradeTermsMessage = (
            <>
                <p className='upgrade-legal-terms'>
                    <FormattedMarkdownMessage
                        id='admin.license.upgrade-and-trial-request.accept-terms-initial-part'
                        defaultMessage='By selecting **Upgrade And Start trial**, I agree to the [Mattermost Software Evaluation Agreement](!https://mattermost.com/software-evaluation-agreement/), [Privacy Policy](!https://mattermost.com/privacy-policy/), and receiving product emails. '
                    />
                    <FormattedMessage
                        id='admin.license.upgrade-and-trial-request.accept-terms-final-part'
                        defaultMessage='Also, I agree to the terms of the Mattermost {eeModalTerms}. Upgrading will download the binary and update your Team Edition instance.'
                        values={{eeModalTerms}}
                    />
                </p>
                {upgradeError && (
                    <div className='upgrade-error'>
                        <div className='form-group has-error'>
                            <label className='control-label'>
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: format(upgradeError),
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                )}
                {restartError && (
                    <div className='col-sm-12'>
                        <div className='form-group has-error'>
                            <label className='control-label'>
                                {restartError}
                            </label>
                        </div>
                    </div>
                )}
            </>
        );
    }
    return (
        <AlertBanner
            mode='info'
            title={
                <FormattedMessage
                    id='licensingPage.infoBanner.startTrialTitle'
                    defaultMessage='Free 30 day trial!'
                />
            }
            message={
                <div className='banner-start-trial'>
                    <p className='license-trial-legal-terms'>
                        {content}
                    </p>
                    <div className='trial'>
                        {trialButton}
                    </div>
                    {upgradeTermsMessage}
                    {gettingTrialErrorMsg}
                </div>
            }
        />
    );
};

export default TrialBanner;
