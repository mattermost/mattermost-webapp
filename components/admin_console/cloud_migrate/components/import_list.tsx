// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage, FormattedDate} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import CloudTable from '../widgets/cloud_table';

import StatusLegend from '../widgets/status_legend';

const downloadLogLink = (url: string) => (
    <a
        target='_new'
        rel='noopener noreferrer'
        href={url}
        className='download_log'
    >
        <FormattedMessage
            id='admin.cloud.migrate.downloadLog'
            defaultMessage='Download Log'
        />
    </a>
);

const header = [
    <FormattedMessage
        id='admin.cloud.migrate.type'
        defaultMessage='Import Type'
        key='type'
    />,
    <FormattedMessage
        id='admin.cloud.migrate.date'
        defaultMessage='Date'
        key='date'
    />,
    <FormattedMessage
        id='admin.cloud.migrate.channels'
        defaultMessage='Channels'
        key='channels'
    />,
    <FormattedMessage
        id='admin.cloud.migrate.users'
        defaultMessage='Users'
        key='users'
    />,
    <FormattedMessage
        id='admin.cloud.migrate.status'
        defaultMessage='Status'
        key='status'
    />,
    <FormattedMessage
        id='admin.cloud.migrate.log'
        defaultMessage='Log'
        key='log'
    />,
];

const list = (importListData: any) => importListData.map((importElement: any) => {
    const chatService = importElement.type;
    return [
        <FormattedMarkdownMessage
            id='admin.cloud.migrate.tableType'
            defaultMessage='{chatService} Import'
            values={{
                chatService,
            }}
            key='type'
        />,
        <FormattedDate
            value={new Date(importElement.date)}
            month='2-digit'
            day='2-digit'
            year='numeric'
            timeZone='UTC'
            key='date'
        />,
        importElement.channels,
        importElement.users,
        <StatusLegend
            status={importElement.status}
            key='status'
        />,
        downloadLogLink(importElement.log),
    ];
});

const importsListTable = (importListData: any) => {
    const list1 = list(importListData);
    return (
        <CloudTable
            header={header}
            list={list1}
        />
    );
};

export default importsListTable;
