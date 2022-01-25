// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import styled from 'styled-components';
import classNames from 'classnames';

import {getServerVersion} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from 'mattermost-redux/types/store';

import Accordion, {AccordionItemType} from 'components/common/accordion/accordion';
import UpdatesAndErrorsSvg from 'components/common/svg_images_components/updates_and_errors_svg';
import ConfigurationSvg from 'components/common/svg_images_components/configuration_svg';
import WorkspaceAccessSvg from 'components/common/svg_images_components/workspace_access_svg';
import PerformanceSvg from 'components/common/svg_images_components/performance_svg';
import SecuritySvg from 'components/common/svg_images_components/security_svg';
import DataPrivacySvg from 'components/common/svg_images_components/data_privacy_svg';
import EasyManagementSvg from 'components/common/svg_images_components/easy_management_svg';

import {testSiteURL} from '../../../actions/admin_actions';
import FormattedAdminHeader from '../../widgets/admin_console/formatted_admin_header';

import {Props} from '../admin_console';

import OverallScore from './overall-score';
import ChipsList, {ChipsInfoType} from './chips_list';

import './dashboard.scss';

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
    }
`;

const WorkspaceOptimizationDashboard = (props: Props) => {
    const [loading, setLoading] = useState(true);
    const [versionData, setVersionData] = useState<{type: string; version: string; status: ItemStatus}>({type: '', version: '', status: 'none'});
    const {formatMessage} = useIntl();

    // get the currently installed server version
    const installedVersion = useSelector((state: GlobalState) => getServerVersion(state));

    // gather locally available data
    const {ServiceSettings} = props.config;
    const {location} = document;

    const sessionLengthWebInDays = ServiceSettings?.SessionLengthWebInDays || -1;

    const testURL = () => {
        const onSuccess = ({status}: any) => {
            data.access.items[0].status = status === 'OK' ? 'none' : 'error';
        };
        const onError = () => {
            data.access.items[0].status = 'error';
        };
        return testSiteURL(onSuccess, onError, location.origin);
    };

    const fetchVersion = async () => {
        // TODO@Michel: replace this with the server API endpoint once the PR got merged
        // @see https://github.com/mattermost/mattermost-server/pull/19366
        const result = await fetch('https://api.github.com/repos/mattermost/mattermost-server/releases/latest').then((result) => result.json());

        if (result.tag_name) {
            const sanitizedVersion = result.tag_name.startsWith('v') ? result.tag_name.slice(1) : result.tag_name;
            const newVersionParts = sanitizedVersion.split('.');
            const installedVersionParts = installedVersion.split('.').slice(0, 3);

            // quick general check if a newer version is available
            let type = '';
            let status: ItemStatus = 'ok';

            if (newVersionParts.join('') > installedVersionParts.join('')) {
                // get correct values to be inserted into the accordion item
                switch (true) {
                case newVersionParts[0] > installedVersionParts[0]:
                    type = formatMessage({id: 'workspaceOptimization.version_type.major', defaultMessage: 'Major'});
                    status = 'error';
                    break;
                case newVersionParts[1] > installedVersionParts[1]:
                    type = formatMessage({id: 'workspaceOptimization.version_type.minor', defaultMessage: 'Minor'});
                    status = 'warning';
                    break;
                case newVersionParts[2] > installedVersionParts[2]:
                    type = formatMessage({id: 'workspaceOptimization.version_type.patch', defaultMessage: 'Patch'});
                    status = 'info';
                    break;
                }
            }

            setVersionData({type, version: result.tag_name, status});
            return;
        }

        const versionIndex = data.updates.items.findIndex((item) => item.id === 'server-version');
        data.updates.items.splice(versionIndex, 1);
    };

    useEffect(() => {
        const promises = [];
        promises.push(testURL());
        promises.push(fetchVersion());
        Promise.all(promises).then(() => setLoading(false));
    }, []);

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
            items: [
                {
                    id: 'server-version',
                    title: versionData.status === 'ok' ? 'Your Mattermost server is running the latest version' : `${versionData.type} version update available`,
                    description: versionData.status === 'ok' ? 'Nothing to do here. All good!' : `Mattermost ${versionData.version} contains a medium level security fix. Upgrading to this release is recommended.`,
                    configUrl: '#',
                    infoUrl: '#',
                    status: versionData.status,
                },
            ],
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

    const overallScoreChipsData: ChipsInfoType = {
        info: 0,
        warning: 0,
        error: 0,
    };

    const accData: AccordionItemType[] = Object.entries(data).map(([accordionKey, accordionData]) => {
        const accordionDataChips: ChipsInfoType = {
            info: 0,
            warning: 0,
            error: 0,
        };
        const items: React.ReactNode[] = [];
        accordionData.items.forEach((item) => {
            if (item.status === undefined) {
                return;
            }
            items.push((
                <AccordionItem
                    key={`${accordionKey}-item_${item.id}`}
                    iconColor={item.status}
                >
                    <h5>
                        <i
                            className={classNames(`icon ${item.status}`, {
                                'icon-check-circle-outline': item.status === 'ok',
                                'icon-alert-outline': item.status === 'warning',
                                'icon-alert-circle-outline': item.status === 'error',
                                'icon-information-outline': item.status === 'info',
                            })}
                        />
                        {item.title}
                    </h5>
                    <p>{item.description}</p>
                </AccordionItem>
            ));

            // chips will only be displayed for info aka Success, warning and error aka Problems
            if (item.status && item.status !== 'none' && item.status !== 'ok') {
                accordionDataChips[item.status] += 1;
                overallScoreChipsData[item.status] += 1;
            }
        });
        const chipsList = (<ChipsList chipsData={accordionDataChips}/>);
        const {title, description, icon} = accordionData;
        return {
            title,
            description,
            icon,
            items,
            extraContent: chipsList,
        };
    });

    const overallScoreChips = (<ChipsList chipsData={overallScoreChipsData}/>);

    return loading ? <p>{'Loading ...'}</p> : (
        <div className='WorkspaceOptimizationDashboard wrapper--fixed'>
            <FormattedAdminHeader
                id='workspaceOptimization.title'
                defaultMessage='Workspace Optimization'
            />
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    <OverallScore chips={overallScoreChips}/>
                    <Accordion
                        accordionItemsData={accData}
                        expandMultiple={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default WorkspaceOptimizationDashboard;
