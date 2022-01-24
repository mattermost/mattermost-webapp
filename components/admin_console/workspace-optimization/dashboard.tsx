// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';

import React, {useEffect, useState} from 'react';
import styled from 'styled-components';

import Accordion, {AccordionItemType} from 'components/common/accordion/accordion';
import UpdatesAndErrorsSvg from 'components/common/svg_images_components/updates_and_errors_svg';
import ConfigurationSvg from 'components/common/svg_images_components/configuration_svg';
import WorkspaceAccessSvg from 'components/common/svg_images_components/workspace_access_svg';
import PerformanceSvg from 'components/common/svg_images_components/performance_svg';
import SecuritySvg from 'components/common/svg_images_components/security_svg';
import DataPrivacySvg from 'components/common/svg_images_components/data_privacy_svg';
import EasyManagementSvg from 'components/common/svg_images_components/easy_management_svg';
import Chip from 'components/common/chip/chip';

import {testSiteURL} from '../../../actions/admin_actions';
import FormattedAdminHeader from '../../widgets/admin_console/formatted_admin_header';

import {Props} from '../admin_console';

import './dashboard.scss';
type DataModel = {
    [key: string]: {
        title: string;
        description: string;
        items: ItemModel[];
        icon: React.ReactNode;
    };
}

type ItemModel = {
    id: string;
    title: string;
    description: string;
    configUrl: string;
    infoUrl: string;
    status: 'none' | 'info' | 'warning' | 'error';
}

const AccordionItem = styled.div<{iconColor: string}>`
    padding: 12px;
    border-bottom: 1px solid #BBB;

    &:last-child {
        border-bottom: none;
    }

    h5 {
        display: inline-flex;
        align-items: center;
        font-weight: bold;

        i {
            color: ${({iconColor}) => `var(${iconColor})`};
        }
    }
`;

const getItemColor = (status: string): string => {
    switch (status) {
    case 'error':
        return '--error-text';
    case 'warning':
        return '--away-indicator';
    case 'suggestion':
        return '--mention-bg';
    case 'none':
    default:
        return '--online-indicator';
    }
};

const WorkspaceOptimizationDashboard = (props: Props) => {
    const [loading, setLoading] = useState(true);

    const {ServiceSettings} = props.config;
    const {location} = document;

    const sessionLengthWebInDays = ServiceSettings?.SessionLengthWebInDays || -1;

    const data: DataModel = {
        updates: {
            title: 'Updates and Errors',
            description: 'You have an update to consider',
            icon: (
                <UpdatesAndErrorsSvg
                    width={22}
                    height={22}
                />
            ),
            items: [],
        },
        configuration: {
            title: 'Configuration',
            description: 'You have configuration problems to resolve',
            icon: (
                <ConfigurationSvg
                    width={20}
                    height={20}
                />
            ),
            items: [
                {
                    id: 'ssl',
                    title: 'Configure SSL to make your server more secure',
                    description: 'You should configure SSL to secure how your server is accessed in a production environment.',
                    configUrl: '/ssl-settings',
                    infoUrl: 'https://www.google.de',
                    status: location.protocol === 'https:' ? 'info' : 'error',
                },
                {
                    id: 'session-length',
                    title: 'Session length is still set to defaults',
                    description: 'Your session length is still set to the default of 30 days. Most servers adjust this according to thier organizations needs. To provide more convenience to your users consider increasing the lengths, however if tighter security is more top of mind then pick a length that better aligns with your organizations policies.',
                    configUrl: '/session-length',
                    infoUrl: 'https://www.google.de',
                    status: sessionLengthWebInDays >= 30 ? 'warning' : 'info',
                },
            ],
        },
        access: {
            title: 'Workspace Access',
            description: 'Web server settings could be affecting access.',
            icon: (
                <WorkspaceAccessSvg
                    width={20}
                    height={20}
                />
            ),
            items: [
                {
                    id: 'site-url',
                    title: 'Misconfigured Web Server',
                    description: 'Your webserver settings are not passing a live URL test, this would prevent users from accessing this workspace, we recommend updating your settings.',
                    configUrl: '/site-url',
                    infoUrl: 'https://www.google.de',
                    status: 'info',
                },
            ],
        },
        performance: {
            title: 'Performance',
            description: 'Your server could use some performance tweaks.',
            icon: (
                <PerformanceSvg
                    width={20}
                    height={20}
                />
            ),
            items: [
                {
                    id: 'performance',
                    title: 'Search performance',
                    description: 'Your server has reached over 500 users and 2 million posts which could result in slow search performance. We recommend starting an enterprise trial with the elastic search feature for better performance.',
                    configUrl: '/site-url',
                    infoUrl: 'https://www.google.de',
                    status: 'info',
                },
            ],
        },
        security: {
            title: 'Security Concerns',
            description: 'There are security concerns you should look at.',
            icon: (
                <SecuritySvg
                    width={20}
                    height={20}
                />
            ),
            items: [
                {
                    id: 'security',
                    title: 'Failed login attempts detected',
                    description: '37 Failed login attempts have been detected. We recommend looking at the security logs to understand the risk.',
                    configUrl: '/site-url',
                    infoUrl: 'https://www.google.de',
                    status: 'warning',
                },
            ],
        },
        dataPrivacy: {
            title: 'Data Privacy',
            description: 'Get better insight and control over your data.',
            icon: (
                <DataPrivacySvg
                    width={20}
                    height={20}
                />
            ),
            items: [
                {
                    id: 'privacy',
                    title: 'Become more data aware',
                    description: 'Alot of organizations in highly regulated indsutries require more control and insight with thier data. Become more aware and take control of your data by trying out data retention and compliance features.',
                    configUrl: '/site-url',
                    infoUrl: 'https://www.google.de',
                    status: 'info',
                },
            ],
        },
        easyManagement: {
            title: 'Ease of management',
            description: 'We have suggestions that could make your managemenet easier.',
            icon: (
                <EasyManagementSvg
                    width={20}
                    height={20}
                />
            ),
            items: [
                {
                    id: 'ldap',
                    title: 'AD/LDAP integration recommended',
                    description: 'You’ve reached over 100 users, we can reduce your manual management pains through AD/LDAP with features like easier onboarding, automatic deactivations and automatic role assignments.',
                    configUrl: '/site-url',
                    infoUrl: 'https://www.google.de',
                    status: 'info',
                },
                {
                    id: 'guests_accounts',
                    title: 'Guest Accounts recommended',
                    description: 'We noticed several accounts using different domains from your Site URL. Gain more control over what other organizations can access with the guest account feature.',
                    configUrl: '/site-url',
                    infoUrl: 'https://www.google.de',
                    status: 'info',
                },
            ],
        },
    };

    useEffect(() => {
        const onSuccess = ({status}: any) => {
            data.access.items[0].status = status === 'OK' ? 'none' : 'error';
            setLoading(false);
        };
        const onError = () => {
            data.access.items[0].status = 'error';
            setLoading(false);
        };
        setTimeout(() => testSiteURL(onSuccess, onError, location.origin), 1000);
    }, []);

    const accData: AccordionItemType[] = Object.entries(data).map(([accordionKey, accordionData]) => {
        const chipsInfo: { [key: string]: number } = {
            info: 0,
            warning: 0,
            error: 0,
        };
        type ChipsInfoKey = keyof typeof chipsInfo;
        const items: React.ReactNode[] = [];
        accordionData.items.forEach((item) => {
            items.push((
                <AccordionItem
                    key={`${accordionKey}-item_${item.id}`}
                    iconColor={getItemColor(item.status)}
                >
                    <h5><i className={classNames('icon', {'icon-check-circle-outline': item.status === 'none', 'icon-alert-outline': item.status === 'warning', 'icon-alert-circle-outline': item.status === 'error'})}/>{item.title}</h5>
                    <p>{item.description}</p>
                </AccordionItem>
            ));
            if (chipsInfo[item.status as ChipsInfoKey] !== undefined) {
                chipsInfo[item.status as ChipsInfoKey] += 1;
            }
        });
        const chipsList = Object.entries(chipsInfo).map(([chipKey, count]) => {
            if (count === 0) {
                return false;
            }
            let id;
            let defaultMessage;

            switch (chipKey) {
            case 'info':
                id = 'admin.reporting.workspace_optimization.suggestions';
                defaultMessage = 'Suggestions';
                break;
            case 'warning':
                id = 'admin.reporting.workspace_optimization.warnings';
                defaultMessage = 'Warnings';
                break;
            case 'error':
                id = 'admin.reporting.workspace_optimization.problems';
                defaultMessage = 'Problems';
                break;
            }

            return (
                <Chip
                    key={chipKey}
                    id={id}
                    defaultMessage={`${defaultMessage}: ${count}`}
                    className={chipKey}
                />
            );
        });
        const {title, description, icon} = accordionData;
        return {
            title,
            description,
            icon,
            items,
            extraContent: chipsList,
        };
    });

    return loading ? <p>{'Loading ...'}</p> : (
        <div className='WorkspaceOptimizationDashboard wrapper--fixed'>
            <FormattedAdminHeader
                id='workspaceOptimization.title'
                defaultMessage='Workspace Optimization'
            />
            <hr/>
            <Accordion
                accordionItemsData={accData}
                expandMultiple={true}
            />
        </div>
    );
};

export default WorkspaceOptimizationDashboard;
