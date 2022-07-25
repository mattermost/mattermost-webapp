import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useIntl} from 'react-intl';

import IconAlertOutline from '@mattermost/compass-icons/components/alert-outline';

import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';
import usePreference from 'components/common/hooks/usePreference';
import useGetSubscriptionProduct from 'components/common/hooks/useGetSubscriptionProduct';

import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import {hasSomeLimits} from 'utils/limits';
import {Preferences, CloudProducts} from 'utils/constants';

import editor_posts_arhived_warning from '';

export default function EditorPostsArchivedWarning() {
    const [limits, limitsLoaded] = useGetLimits();
    const intl = useIntl();
    const usage = useGetUsage();
    const product = useGetSubscriptionProduct();
    const [triedUploadingInChannel, setTriedUploadingInChannel] = useState(false);
    const [hideFileUpgradeWarningPreference, setHideFileUpgradeWarningPreference] = usePreference(Preferences.CATEGORY_CLOUD_LIMITS, Preferences.HIDE_POST_FILE_UPGRADE_WARNING)
    const isAdmin = useSelector(isCurrentUserSystemAdmin);

    // TODO: figure out what persistence of warning should be if removing file from draft post
    // or changing channel.
    useEffect(() => {
        if (false) {
            setTriedUploadingInChannel(true);
        }
    }, [])

    if (
        !limitsLoaded ||
        !hasSomeLimits(limits) ||
        (limits?.files?.total_storage || 0) <= usage.files.totalStorage ||
        !triedUploadingInChannel ||
        hideFileUpgradeWarningPreference
    ) {
        return null;
    }

    let upgradeVariant = intl.formatMessage({
        id: "workspace_limits.upgrade_for_file.upgrade_to_paid",
        defaultMessage: "upgrade to a paid plan",
    });
    if (product?.sku !== CloudProducts.STARTER) {
        upgradeVariant = intl.formatMessage({
            id: "workspace_limits.upgrade_for_file.upgrade_paid_tier",
            defaultMessage: "upgrade your plan",
        });
    }

    const ctaValues = {
        upgradeVariant,
        a: (chunks: React.ReactNode | React.ReactNodeArray) => (
            <a onClick={() => {}}>
                {chunks}
            </a>
        ),
    }

    let cta = intl.formatMessage(
        {
            id: "workspace_limits.upgrade_for_file.archive_warning.end_user_cta",
            defaultMessage: "To view them again, notify your admin to <a>{upgradeVariant}</a>.",
        },
        ctaValues,
    );

    if (isAdmin) {
        cta = intl.formatMessage(
            {
                id: "workspace_limits.upgrade_for_file.archive_warning.admin_cta",
                defaultMessage: "To view them again, you can delete older files or <a>{upgradeVariant}.</a>",
            },
            ctaValues,
        );
    }

    const dismiss = <i
        className={'icon-TODO'}
        onClick={() => setHideFileUpgradeWarningPreference(Date.now().toString())}
    />

    return <div className='EditorPostsArchivedWarning '>
        <IconAlertOutline color='var(--away-indicator)'/>
        <div>
            {intl.formatMessage({

                id: "workspace_limits.upgrade_for_file.archive_warning",
                defaultMessage: "Your free plan is limited to {storageLimit} of files. New uploads will automatically archive older files.",
            })}
            {' '}
            {cta}
        </div>
        {dismiss}
    </div>
}
