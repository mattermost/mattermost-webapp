// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage, FormattedDate} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import CloudTable from '../widgets/cloud_table';

import StatusLegend from '../widgets/status_legend';

import ProgressBar from '../widgets/progress_bar';

const downloadLogLink = (url: string) => (
    <a
        target='_new'
        rel='noopener noreferrer'
        href={url}
        className='download_log'
    >
        <FormattedMessage
            id='admin.cloud.import.downloadLog'
            defaultMessage='Download Log'
        />
    </a>
);

const header = [
    <FormattedMessage
        id='admin.cloud.import.type'
        defaultMessage='Import Type'
        key='type'
    />,
    <FormattedMessage
        id='admin.cloud.import.date'
        defaultMessage='Date'
        key='date'
    />,
    <FormattedMessage
        id='admin.cloud.import.channels'
        defaultMessage='Channels'
        key='channels'
    />,
    <FormattedMessage
        id='admin.cloud.import.users'
        defaultMessage='Users'
        key='users'
    />,
    <FormattedMessage
        id='admin.cloud.import.status'
        defaultMessage='Status'
        key='status'
    />,
    <FormattedMessage
        id='admin.cloud.import.log'
        defaultMessage='Log'
        key='log'
    />,
];

const list = (importListData: any, percentage: number) => importListData.map((importElement: any) => {
    const chatService = importElement.type;
    const logCell = importElement.status === 'in_progress' ? (
        <ProgressBar
            percentage={percentage}
            width={100}
        />
    ) : downloadLogLink(importElement.log);
    return [
        <FormattedMarkdownMessage
            id='admin.cloud.import.tableType'
            defaultMessage='**{chatService} Import**'
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
        logCell,
    ];
});

const importsListTable = (importListData: any, percentage: number) => {
    const list1 = list(importListData, percentage);
    return (
        <CloudTable
            header={header}
            list={list1}
        />
    );
};

export default importsListTable;
