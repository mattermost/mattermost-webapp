import React from 'react';
import {formatMessage, useIntl} from 'react-intl';

import ConfigurationSvg from 'components/common/svg_images_components/configuration_svg';
import DataPrivacySvg from 'components/common/svg_images_components/data_privacy_svg';
import EasyManagementSvg from 'components/common/svg_images_components/easy_management_svg';
import PerformanceSvg from 'components/common/svg_images_components/performance_svg';
import SecuritySvg from 'components/common/svg_images_components/security_svg';
import UpdatesAndErrorsSvg from 'components/common/svg_images_components/updates_and_errors_svg';
import WorkspaceAccessSvg from 'components/common/svg_images_components/workspace_access_svg';

type DataModel = {
    [key: string]: {
        title: string;
        description: string;
        items: ItemModel[];
        icon: React.ReactNode;
    };
}

type ItemStatus = 'none' | 'ok' | 'info' | 'warning' | 'error';

type ItemModel = {
    id: string;
    title: string;
    description: string;
    configUrl: string;
    infoUrl: string;
    status: ItemStatus;
}

const getTranslationId = (key: string) => `admin.reporting.workspace_optimization.${key}`;

type UpdatesParam = {
    serverVersion: {
        version: string;
        type: string;
        status: ItemStatus;
    };
}

const useMetricsData = () => {
    const {formatMessage} = useIntl();

    const getUpdatesData = (data: UpdatesParam) => ({
        title: formatMessage({id: getTranslationId('updates.title'), defaultMessage: 'Updates and Errors'}),
        description: formatMessage({id: getTranslationId('updates.description'), defaultMessage: 'You have an update to consider'}),
        icon: (
            <UpdatesAndErrorsSvg
                width={22}
                height={22}
            />
        ),
        items: [
            {
                id: 'server_version',
                title: data.serverVersion.status === 'ok' ? formatMessage({
                    id: getTranslationId('updates.server_version.status.ok.title'),
                    defaultMessage: 'Your Mattermost server is running the latest version',
                }) : formatMessage({
                    id: getTranslationId('updates.server_version.status.error.title'),
                    defaultMessage: '{type} version update available',
                }, {type: data.serverVersion.type}),
                description: data.serverVersion.status === 'ok' ? formatMessage({
                    id: getTranslationId('updates.server_version.status.ok.description'),
                    defaultMessage: 'Placeholder: Nothing to do here. All good!',
                }) : formatMessage({
                    id: getTranslationId('updates.server_version.status.error.description'),
                    defaultMessage: 'Placeholder: Mattermost {version} contains a medium level security fix. Upgrading to this release is recommended.',
                }, {version: data.serverVersion.version}),
                configUrl: '#',
                infoUrl: '#',
                status: data.serverVersion.status,
            },
        ],
    });

    type ConfigurationParam = {
        ssl: {
            status: ItemStatus;
        };
        sessionLength: {
            status: ItemStatus;
        };
    }

    const getConfigurationData = (data: ConfigurationParam) => ({
        title: formatMessage({id: getTranslationId('configuration.title'), defaultMessage: 'Configuration'}),
        description: formatMessage({id: getTranslationId('configuration.description'), defaultMessage: 'You have configuration problems to resolve'}),
        icon: (
            <ConfigurationSvg
                width={20}
                height={20}
            />
        ),
        items: [
            {
                id: 'ssl',
                title: formatMessage({
                    id: getTranslationId('configuration.ssl.title'),
                    defaultMessage: 'Configure SSL to make your server more secure',
                }),
                description: formatMessage({
                    id: getTranslationId('configuration.ssl.title'),
                    defaultMessage: 'You should configure SSL to secure how your server is accessed in a production environment.',
                }),
                configUrl: '/ssl-settings',
                infoUrl: 'https://www.google.de',
                status: data.ssl.status,
            },
            {
                id: 'session-length',
                title: formatMessage({
                    id: getTranslationId('session_length.title'),
                    defaultMessage: 'Session length is still set to defaults',
                }),
                description: formatMessage({
                    id: getTranslationId('session_length.title'),
                    defaultMessage: 'Your session length is still set to the default of 30 days. Most servers adjust this according to thier organizations needs. To provide more convenience to your users consider increasing the lengths, however if tighter security is more top of mind then pick a length that better aligns with your organizations policies.',
                }),
                configUrl: '/session-length',
                infoUrl: 'https://www.google.de',
                status: data.sessionLength.status,
            },
        ],
    });

    type AccessParam = {
        siteUrl: {
            status: ItemStatus;
        };
    }

    const getAccessData = (data: AccessParam) => ({
        title: formatMessage({
            id: getTranslationId('access.title'),
            defaultMessage: 'Workspace Access',
        }),
        description: formatMessage({
            id: getTranslationId('access.description'),
            defaultMessage: 'Web server settings could be affecting access.',
        }),
        icon: (
            <WorkspaceAccessSvg
                width={20}
                height={20}
            />
        ),
        items: [
            {
                id: 'site-url',
                title: formatMessage({
                    id: getTranslationId('access.site_url.title'),
                    defaultMessage: 'Misconfigured Web Server',
                }),
                description: formatMessage({
                    id: getTranslationId('access.site_url.description'),
                    defaultMessage: 'Your webserver settings are not passing a live URL test, this would prevent users from accessing this workspace, we recommend updating your settings.',
                }),
                configUrl: '/site-url',
                infoUrl: 'https://www.google.de',
                status: data.siteUrl.status,
            },
        ],
    });

    type PerformanceParam = {
        search: {
            totalUsers: number;
            totalPosts: number;
            status: ItemStatus;
        };
    }

    const getPerformanceData = (data: PerformanceParam) => ({
        title: formatMessage({
            id: getTranslationId('performance.title'),
            defaultMessage: 'Performance',
        }),
        description: formatMessage({
            id: getTranslationId('performance.description'),
            defaultMessage: 'Your server could use some performance tweaks.',
        }),
        icon: (
            <PerformanceSvg
                width={20}
                height={20}
            />
        ),
        items: [
            {
                id: 'search',
                title: formatMessage({
                    id: getTranslationId('performance.search.title'),
                    defaultMessage: 'Search performance',
                }),
                description: formatMessage({
                    id: getTranslationId('performance.search.description'),
                    defaultMessage: 'Your server has reached over {users} users and {posts} posts which could result in slow search performance. We recommend starting an enterprise trial with the elastic search feature for better performance.',
                }, {users: data.search.totalUsers, posts: data.search.totalPosts}),
                configUrl: '/site-url',
                infoUrl: 'https://www.google.de',
                status: data.search.status,
            },
        ],
    });

    return {getAccessData, getConfigurationData, getUpdatesData, getPerformanceData};
};

// const data: DataModel = {
//     security: {
//         title: 'Security Concerns',
//         description: 'There are security concerns you should look at.',
//         icon: (
//             <SecuritySvg
//                 width={20}
//                 height={20}
//             />
//         ),
//         items: [
//             {
//                 id: 'security',
//                 title: 'Failed login attempts detected',
//                 description: '37 Failed login attempts have been detected. We recommend looking at the security logs to understand the risk.',
//                 configUrl: '/site-url',
//                 infoUrl: 'https://www.google.de',
//                 status: 'warning',
//             },
//         ],
//     },
//     dataPrivacy: {
//         title: 'Data Privacy',
//         description: 'Get better insight and control over your data.',
//         icon: (
//             <DataPrivacySvg
//                 width={20}
//                 height={20}
//             />
//         ),
//         items: [
//             {
//                 id: 'privacy',
//                 title: 'Become more data aware',
//                 description: 'A lot of organizations in highly regulated indsutries require more control and insight with thier data. Become more aware and take control of your data by trying out data retention and compliance features.',
//                 configUrl: '/site-url',
//                 infoUrl: 'https://www.google.de',
//                 status: 'info',
//             },
//         ],
//     },
//     easyManagement: {
//         title: 'Ease of management',
//         description: 'We have suggestions that could make your managemenet easier.',
//         icon: (
//             <EasyManagementSvg
//                 width={20}
//                 height={20}
//             />
//         ),
//         items: [
//             {
//                 id: 'ldap',
//                 title: 'AD/LDAP integration recommended',
//                 description: 'You’ve reached over 100 users, we can reduce your manual management pains through AD/LDAP with features like easier onboarding, automatic deactivations and automatic role assignments.',
//                 configUrl: '/site-url',
//                 infoUrl: 'https://www.google.de',
//                 status: 'info',
//             },
//             {
//                 id: 'guests_accounts',
//                 title: 'Guest Accounts recommended',
//                 description: 'We noticed several accounts using different domains from your Site URL. Gain more control over what other organizations can access with the guest account feature.',
//                 configUrl: '/site-url',
//                 infoUrl: 'https://www.google.de',
//                 status: 'info',
//             },
//         ],
//     },
// };

export {DataModel, ItemModel, ItemStatus};
export default useMetricsData;
