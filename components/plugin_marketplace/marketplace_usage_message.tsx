// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage, useIntl} from 'react-intl';
import classNames from 'classnames';

import {getCloudLimits} from 'mattermost-redux/selectors/entities/cloud';
import {isIntegrationsUsageAtLimit} from 'mattermost-redux/selectors/entities/usage';
import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import CloseIcon from 'components/widgets/icons/close_icon';

import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import usePreference from 'components/common/hooks/usePreference';

const HIDE_USAGE_MESSAGE_PREFERENCE_CATEGORY = 'usage_limits';
const HIDE_USAGE_MESSAGE_PREFERENCE_NAME = 'hide_marketplace_usage_message';
const TEN_DAYS = 1000 * 60 * 60 * 24 * 10;

export default function MarketplaceUsageMessage() {
    const {formatMessage} = useIntl();

    const openPricingModal = useOpenPricingModal();
    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const reachedLimit = useSelector(isIntegrationsUsageAtLimit);
    const limits = useSelector(getCloudLimits);
    const [preferenceValue, setPreference] = usePreference(HIDE_USAGE_MESSAGE_PREFERENCE_CATEGORY, HIDE_USAGE_MESSAGE_PREFERENCE_NAME);

    if (!isCloudFreeEnabled || !limits.integrations?.enabled) {
        return null;
    }

    if (!reachedLimit && preferenceValue) {
        const before = parseInt(preferenceValue, 10);
        const now = new Date().getTime();
        if ((now - before) < TEN_DAYS) {
            return null;
        }
    }

    let limitMessage: React.ReactNode;
    let upgradeButtonLabel: React.ReactNode;
    if (reachedLimit) {
        limitMessage = (
            <FormattedMessage
                id={'marketplace_modal.usage_message.reached_limit'}
                defaultMessage={'Integrations limits reached. Upgrade to install unlimited integrations.'}
            />
        );

        upgradeButtonLabel = (
            <FormattedMessage
                id={'marketplace_modal.usage_message.upgrade_now'}
                defaultMessage={'Upgrade now'}
            />
        );
    } else {
        limitMessage = (
            <FormattedMessage
                id={'marketplace_modal.usage_message.below_limit'}
                defaultMessage={'Your workspace is limited to {limit} enabled integrations.'}
                values={{
                    limit: limits.integrations.enabled,
                }}
            />
        );

        upgradeButtonLabel = (
            <FormattedMessage
                id={'marketplace_modal.usage_message.view_plans'}
                defaultMessage={'View plans'}
            />
        );
    }

    const upgradeButtons = (
        <div className='upgrade-buttons'>
            <button
                onClick={openPricingModal}
                className='btn btn-primary'
            >
                {upgradeButtonLabel}
            </button>
        </div>
    );

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

    const closeIcon = (
        <button
            onClick={() => setPreference(new Date().getTime().toString())}
            className='close-x'
            aria-label={formatMessage({id: 'full_screen_modal.close', defaultMessage: 'Close'})}
        >
            <CloseIcon id='closeIcon'/>
        </button>
    );

    return (
        <div className={classNames('marketplace-usage-message', {danger: reachedLimit, info: !reachedLimit})}>
            <strong>
                {limitMessage}
            </strong>
            {upgradeInstructions}
            {upgradeButtons}
            {!reachedLimit && closeIcon}
        </div>
    );
}
