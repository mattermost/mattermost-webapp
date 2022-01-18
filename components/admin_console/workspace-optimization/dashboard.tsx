// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';

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
    title: string;
    description: string;
    configUrl: string;
    infoUrl: string;
    status: 'none' | 'info' | 'warning' | 'error';
}

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
                    title: 'SSL',
                    description: '"SSL" description. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
                    configUrl: '/ssl-settings',
                    infoUrl: 'https://www.google.de',
                    status: location.protocol === 'https:' ? 'none' : 'error',
                },
                {
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

    const cards = Object.keys(data);

    return loading ? <p>{'Loading ...'}</p> : (
        <div>
            <h1>{'Workspace Optimization Dashboard'}</h1>
            <hr/>
            <h3>{'DataRetention'}</h3>
            <p>{`DeletionJobStartTime: ${props.config.DataRetentionSettings?.DeletionJobStartTime}`}</p>
            <p>{`FileRetentionDays: ${props.config.DataRetentionSettings?.FileRetentionDays}`}</p>
            <p>{`EnableFileDeletion: ${props.config.DataRetentionSettings?.EnableFileDeletion}`}</p>
            <p>{`MessageRetentionDays: ${props.config.DataRetentionSettings?.MessageRetentionDays}`}</p>
            <p>{`EnableMessageDeletion: ${props.config.DataRetentionSettings?.EnableMessageDeletion}`}</p>
            <hr/>
            <h3>{'Session Length'}</h3>
            <p>{`SessionLengthWebInDays: ${props.config.ServiceSettings?.SessionLengthWebInDays}`}</p>
            <p>{`SessionLengthMobileInDays: ${props.config.ServiceSettings?.SessionLengthMobileInDays}`}</p>
            <p>{`SessionLengthSSOInDays: ${props.config.ServiceSettings?.SessionLengthSSOInDays}`}</p>
            <p>{`ExtendSessionLengthWithActivity: ${props.config.ServiceSettings?.ExtendSessionLengthWithActivity}`}</p>
            <hr/>
            <br/>
            <br/>
            {cards.map((card) => (
                <div key={'card'}>
                    <h4>{data[card].title}</h4>
                    <h5>{data[card].description}</h5>
                    <hr/>
                    {data[card].items.map((item) => (
                        <>
                            <strong><p>{item.title}</p></strong>
                            <p>{item.description}</p>
                        </>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default WorkspaceOptimizationDashboard;
