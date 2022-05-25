import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {FormattedMessage, useIntl} from 'react-intl';

import {getCloudLimits} from 'mattermost-redux/selectors/entities/cloud';
import {getIntegrationsUsage} from 'mattermost-redux/selectors/entities/usage';
import {cloudFreeEnabled, getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';

import {getCloudLimits as fetchCloudLimits} from 'actions/cloud';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import CloseIcon from 'components/widgets/icons/close_icon';

const usePreferenceCheck = (): [boolean, () => void] => {
    const [visible, setVisible] = useState(true);
    const preferences = useSelector(getMyPreferences);

    const hide = () => {
        setVisible(false);
    };

    return [visible, hide];
}

export default function MarketplaceUsageMessage() {
    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const usage = useSelector(getIntegrationsUsage);
    const limits = useSelector(getCloudLimits);
    const intl = useIntl();
    const dispatch = useDispatch();

    const [visibleDueToPreferences, closeUsage] = usePreferenceCheck();

    useEffect(() => {
        if (isCloudFreeEnabled) {
            dispatch(fetchCloudLimits());
        }
    }, [isCloudFreeEnabled]);

    if (!isCloudFreeEnabled || !visibleDueToPreferences || !usage?.enabled || !limits.integrations?.enabled) {
        return null;
    }

    let limitMessage: React.ReactNode;
    if (usage.enabled < limits.integrations.enabled) {
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
            <button className='btn btn-primary'>
                {'Try free for 30 days'}
            </button>
            <button className='btn btn-default'>
                {'Upgrade now'}
            </button>
        </div>
    );

    const closeIcon = (
        <button
            onClick={closeUsage}
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
