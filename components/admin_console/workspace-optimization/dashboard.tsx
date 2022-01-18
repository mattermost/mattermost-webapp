// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';

import {testSiteURL} from '../../../actions/admin_actions';

import {Props} from '../admin_console';

type DataModel = {
    [key: string]: {
        title: string;
        description: string;
        items: ItemModel[];
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

const Accordion = styled.div`
    margin: 12px;
    border: 1px solid #BBB;
    box-shadow: 0 0 2px rgba(0,0,0,0.2);
    border-radius: 4px;
    background: white;
`;

const AccordionHeader = styled.div`
    padding: 12px;
    border-bottom: 1px solid #BBB;

    h4 {
        margin: 0 0 6px 0;
    }
`;

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

    const {location} = document;

    const data: DataModel = {
        updates: {
            title: 'Updates',
            description: '"Updates" description. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
            items: [],
        },
        configuration: {
            title: 'Configuration',
            description: '"Configuration" description. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
            items: [
                {
                    id: 'ssl',
                    title: 'SSL',
                    description: '"SSL" description. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
                    configUrl: '/ssl-settings',
                    infoUrl: 'https://www.google.de',
                    status: location.protocol === 'https:' ? 'none' : 'error',
                },
                {
                    id: 'session-length',
                    title: 'Session length',
                    description: '"Session Length" description. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
                    configUrl: '/session-length',
                    infoUrl: 'https://www.google.de',
                    status: 'none',
                },
            ],
        },
        access: {
            title: 'Workspace Access',
            description: '"Workspace Access" description. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
            items: [
                {
                    id: 'site-url',
                    title: 'Site URL',
                    description: '"Site URL" description. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
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

    const dataKey = Object.keys(data);

    return loading ? <p>{'Loading ...'}</p> : (
        <div>
            <h1>{'Workspace Optimization Dashboard'}</h1>
            <hr/>
            {dataKey.map((key) => (
                <Accordion key={key}>
                    <AccordionHeader>
                        <h4>{data[key].title}</h4>
                        <p>{data[key].description}</p>
                    </AccordionHeader>
                    {data[key].items.map((item) => (
                        <AccordionItem
                            key={`${key}-item_${item.id}`}
                            iconColor={getItemColor(item.status)}
                        >
                            <h5><i className={classNames('icon', {'icon-check-circle-outline': item.status === 'none', 'icon-alert-outline': item.status === 'warning', 'icon-alert-circle-outline': item.status === 'error'})}/>{item.title}</h5>
                            <p>{item.description}</p>
                        </AccordionItem>
                    ))}
                </Accordion>
            ))}
        </div>
    );
};

export default WorkspaceOptimizationDashboard;
