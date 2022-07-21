// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import {fallbackStarterLimits, fallbackProfessionalLimits, asGBString, hasSomeLimits} from 'utils/limits';
import useGetLimits from 'components/common/hooks/useGetLimits';
import {CloudProducts} from 'utils/constants';

import './feature_list.scss';

export interface FeatureListProps {
    subscriptionPlan?: string;
    isLegacyFree: boolean;
}

const FeatureList = (props: FeatureListProps) => {
    const intl = useIntl();
    const [limits] = useGetLimits();
    const featuresFreeTier = [
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.99uptime',
            defaultMessage: '99.0% uptime',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.selfServiceDocumentation',
            defaultMessage: 'Self-Service documentation and forum support',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.mfaAuthentication',
            defaultMessage: 'Google, GitLab, O365 & MFA Authentication',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.guestAccounts',
            defaultMessage: 'Guest Accounts',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.unlimitedIntegrations',
            defaultMessage: 'Unlimited Integrations',
        }),
    ];

    const featuresCloudStarter = [
        intl.formatMessage(
            {
                id: 'admin.billing.subscription.planDetails.features.limitedMessageHistory',
                defaultMessage: 'Limited to a message history of {limit} messages',
            },
            {
                limit: intl.formatNumber(limits.messages?.history ?? fallbackStarterLimits.messages.history),
            },
        ),
        intl.formatMessage(
            {
                id: 'admin.billing.subscription.planDetails.features.limitedIntegrationsEnabled',
                defaultMessage: 'Limited to {limit} Apps and Plugins',
            },
            {
                limit: intl.formatNumber(limits.integrations?.enabled ?? fallbackStarterLimits.integrations.enabled),
            },
        ),
        intl.formatMessage(
            {
                id: 'admin.billing.subscription.planDetails.features.limitedFileStorage',
                defaultMessage: 'Limited to {limit} File Storage',
            },
            {

                limit: asGBString(limits.files?.total_storage ?? fallbackStarterLimits.files.totalStorage, intl.formatNumber),
            },
        ),
        intl.formatMessage(
            {
                id: 'admin.billing.subscription.planDetails.features.limitedBoardCards',
                defaultMessage: 'Limited to {limit} board cards per workspace',
            },
            {

                limit: intl.formatNumber(limits.boards?.cards ?? fallbackStarterLimits.boards.cards),
            },
        ),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.groupAndOneToOneMessaging',
            defaultMessage: 'Group and one-to-one messaging, file sharing, and search',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.incidentCollaboration',
            defaultMessage: 'Incident collaboration',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.unlimitedUsers',
            defaultMessage: 'Unlimited users',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.mfa',
            defaultMessage: 'Multi-Factor Authentication (MFA)',
        }),
    ];

    const featuresCloudStarterLegacy = [
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.groupAndOneToOneMessaging',
            defaultMessage: 'Group and one-to-one messaging, file sharing, and search',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.incidentCollaboration',
            defaultMessage: 'Incident collaboration',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.unlimittedUsersAndMessagingHistory',
            defaultMessage: 'Unlimited users & message history',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.mfa',
            defaultMessage: 'Multi-Factor Authentication (MFA)',
        }),
    ];

    const featuresCloudProfessional = [
        intl.formatMessage(
            {
                id: 'admin.billing.subscription.planDetails.features.fileStorage',
                defaultMessage: '{limit} file storage',
            },
            {
                limit: asGBString(fallbackProfessionalLimits.files.totalStorage, intl.formatNumber),
            },
        ),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.guestAccounts',
            defaultMessage: 'Guest Accounts',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.ldapUserSync',
            defaultMessage: 'AD/LDAP user sync',
        }),

        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.ssoSaml',
            defaultMessage: 'SSO w/ SAML (includes Okta and OneLogIn)',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.multiplatformSso',
            defaultMessage: 'SSO with Google, O365',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.openid',
            defaultMessage: 'OpenID',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.mfaEnforcement',
            defaultMessage: 'MFA enforcement',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.advanceTeamPermission',
            defaultMessage: 'Advanced team permissions',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.readOnlyChannels',
            defaultMessage: 'Read-only announcement channels',
        }),
    ];

    const featuresCloudEnterprise = [
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.enterpriseAdminAndSso',
            defaultMessage: 'Enterprise administration & SSO',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.autoComplianceExports',
            defaultMessage: 'Automated compliance exports',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.customRetentionPolicies',
            defaultMessage: 'Custom data retention policies',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.sharedChannels',
            defaultMessage: 'Shared channels (coming soon)',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.ldapSync',
            defaultMessage: 'AD/LDAP group sync to teams & channels',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.premiumSupport',
            defaultMessage: 'Premium Support (optional upgrade)',
        }),
    ];

    let features;

    if (props.isLegacyFree) {
        features = featuresFreeTier;
    } else {
        switch (props.subscriptionPlan) {
        case CloudProducts.PROFESSIONAL:
            features = featuresCloudProfessional;
            break;

        case CloudProducts.STARTER:
            features = hasSomeLimits(limits) ? featuresCloudStarter : featuresCloudStarterLegacy;
            break;
        case CloudProducts.ENTERPRISE:
            features = featuresCloudEnterprise;
            break;
        default:
            // must be CloudProducts.LEGACY
            features = featuresFreeTier;
            break;
        }
    }

    const featureElements = features?.map((feature, i) => (
        <div
            key={`PlanDetailsFeature${i.toString()}`}
            className='PlanDetailsFeature'
        >
            <i className='icon-check'/>
            <span>{feature}</span>
        </div>
    ));

    return <>{featureElements}</>;
};

export default FeatureList;
