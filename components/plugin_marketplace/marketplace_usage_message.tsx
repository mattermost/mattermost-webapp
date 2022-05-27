// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {FormattedMessage, useIntl} from 'react-intl';

import {PreferenceType} from '@mattermost/types/preferences';

import {getCloudLimits} from 'mattermost-redux/selectors/entities/cloud';
import {getIntegrationsUsage} from 'mattermost-redux/selectors/entities/usage';
import {cloudFreeEnabled, getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';

import {savePreferences} from 'mattermost-redux/actions/preferences';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import CloseIcon from 'components/widgets/icons/close_icon';
import CloudStartTrialButton from 'components/cloud_start_trial/cloud_start_trial_btn';

const HIDE_USAGE_MESSAGE_PREFERENCE_CATEGORY = 'usage_limits';
const HIDE_USAGE_MESSAGE_PREFERENCE_NAME = 'hide_marketplace_usage_message';

const usePreferenceCheck = (): [boolean, (value: boolean) => void] => {
    const userId = useSelector(getCurrentUserId);
    const preferences = useSelector(getMyPreferences);

    const key = getPreferenceKey(HIDE_USAGE_MESSAGE_PREFERENCE_CATEGORY, HIDE_USAGE_MESSAGE_PREFERENCE_NAME);
    const preference = preferences[key];
    const hiddenDueToPreference = preference?.value === 'true';

    const dispatch = useDispatch();
    const setHidePreference = (value: boolean) => {
        const preference: PreferenceType = {
            category: HIDE_USAGE_MESSAGE_PREFERENCE_CATEGORY,
            name: HIDE_USAGE_MESSAGE_PREFERENCE_NAME,
            user_id: userId,
            value: value.toString(),
        };
        dispatch(savePreferences(userId, [preference]));
    };

    return [hiddenDueToPreference, setHidePreference];
};

export default function MarketplaceUsageMessage() {
    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const integrationsUsage = useSelector(getIntegrationsUsage);
    const limits = useSelector(getCloudLimits);
    const [hiddenDueToPreferences, setHidePreference] = usePreferenceCheck();
    const intl = useIntl();

    if (hiddenDueToPreferences || !isCloudFreeEnabled || !integrationsUsage?.enabledLoaded || !limits.integrations?.enabled) {
        return (
            <button
                className='btn btn-primary'
                onClick={() => setHidePreference(false)}
            >
                {'DEBUG reset preference'}
            </button>
        );
    }

    let limitMessage: React.ReactNode;
    if (integrationsUsage.enabled < limits.integrations.enabled) {
        limitMessage = (
            <FormattedMessage
                id={'marketplace_modal.usage_message.below_limit'}
                defaultMessage={'Your workspace is limited to {limit} enabled integrations.'}
                values={{
                    limit: limits.integrations.enabled,
                }}
            />
        );
    } else {
        limitMessage = (
            <FormattedMessage
                id={'marketplace_modal.usage_message.reached_limit'}
                defaultMessage={'Integrations limits reached. Upgrade to install unlimited integrations.'}
            />
        );
    }

    const upgradeInstructions = (
        <p>
            <FormattedMarkdownMessage
                id={'marketplace_modal.usage_message.upgrade_instructions'}
                defaultMessage={'To install unlimited integrations, upgrade to one of our paid plans. [Review our plan options and pricing]({url}).'}
                values={{
                    url: 'https://mattermost.com/pricing',
                }}
            />
        </p>
    );

    const upgradeButtons = (
        <div className='upgrade-buttons'>
            <CloudStartTrialButton
                message={'Try free for 30 days'}
                telemetryId={'start_cloud_trial_from_marketplace'}
                onClick={() => setHidePreference(true)}
                extraClass={'btn btn-primary start-cloud-trial-btn'}
            />
            <a
                href='https://mattermost.com/pricing'
                target='_blank'
                rel='noreferrer'
            >
                <button className='btn btn-default'>
                    {'Upgrade now'}
                </button>
            </a>
        </div>
    );

    const closeIcon = (
        <button
            onClick={() => setHidePreference(true)}
            className='close-x'
            aria-label={intl.formatMessage({id: 'full_screen_modal.close', defaultMessage: 'Close'})}
        >
            <CloseIcon id='closeIcon'/>
        </button>
    );

    return (
        <div className='marketplace-usage-message'>
            <strong>
                {limitMessage}
            </strong>
            {upgradeInstructions}
            {upgradeButtons}
            {closeIcon}
        </div>
    );
}
