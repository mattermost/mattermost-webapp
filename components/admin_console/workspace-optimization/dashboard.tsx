// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';

import React, {useEffect, useState} from 'react';
import styled from 'styled-components';

import Accordion, {AccordionItemType} from 'components/common/accordion/accordion';
import UpdatesAndErrorsSvg from 'components/common/svg_images_components/updates_and_errors_svg';
import ConfigurationSvg from 'components/common/svg_images_components/configuration_svg';
import WorkspaceAccessSvg from 'components/common/svg_images_components/workspace_access_svg';

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
                    status: location.protocol === 'https:' ? 'none' : 'error',
                },
                {
                    id: 'session-length',
                    title: 'Session length is still set to defaults',
                    description: 'Your session length is still set to the default of 30 days. Most servers adjust this according to thier organizations needs. To provide more convenience to your users consider increasing the lengths, however if tighter security is more top of mind then pick a length that better aligns with your organizations policies.',
                    configUrl: '/session-length',
                    infoUrl: 'https://www.google.de',
                    status: sessionLengthWebInDays >= 30 ? 'warning' : 'none',
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
                    status: 'none',
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
        const items = accordionData.items.map((item) => (
            <AccordionItem
                key={`${accordionKey}-item_${item.id}`}
                iconColor={getItemColor(item.status)}
            >
                <h5><i className={classNames('icon', {'icon-check-circle-outline': item.status === 'none', 'icon-alert-outline': item.status === 'warning', 'icon-alert-circle-outline': item.status === 'error'})}/>{item.title}</h5>
                <p>{item.description}</p>
            </AccordionItem>
        ));
        const {title, description, icon} = accordionData;
        return {
            title,
            description,
            icon,
            items,
        };
    });

    return loading ? <p>{'Loading ...'}</p> : (
        <div className='WorkspaceOptimizationDashboard'>
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
