// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.


import React, {useEffect, useState} from 'react';
import {useDispatch, useStore, useSelector} from 'react-redux';
import {FormattedMessage, useIntl, FormattedDate} from 'react-intl';

import {getStandardAnalytics} from 'mattermost-redux/actions/admin';
import {getCloudSubscription, getCloudProducts, getCloudCustomer} from 'mattermost-redux/actions/cloud';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {DispatchFunc} from 'mattermost-redux/types/actions';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import {pageVisited, trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';
import AlertBanner from 'components/alert_banner';
import BlockableLink from 'components/admin_console/blockable_link';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import PurchaseModal from 'components/purchase_modal';
import AdminHeader from 'components/widgets/admin_console/admin_header';

import {getCloudContactUsLink, InquiryType, InquiryIssue} from 'selectors/cloud';
import {GlobalState} from 'types/store';
import {
    Preferences,
    CloudBanners,
    CloudLinks,
    ModalIdentifiers,
    TELEMETRY_CATEGORIES,
} from 'utils/constants';

import './migrate_workspace.scss';
import ImportSvg from './import.svg';
import CloudCard from 'components/common/cloud_card';
import Badge from 'components/widgets/badges/badge';

const MigrateWorkspace: React.FC = () => {
    const {formatMessage} = useIntl();
    const store = useStore();
    const [importList, setImportList] = useState(["Import 1", "Import 2"]);
    const [chatService, setchatService] = useState('Slack');
    const [toBackButton, setToBackButton] = useState('null');
    const [step, setStep] = useState(0);

    useEffect(() => {
        
    }, []);

    const importListData = [{
            id: 1,    
            type: 'Slack',
            date: new Date(),
            channels: 5,
            users: 13,
            status: 'completed',
            log: 'Download log'
        },
        {
            id: 2,
            type: 'Slack',
            date: new Date(),
            channels: 5,
            users: 13,
            status: 'in_progress',
            log: 'Download log'
        },
        {
            id: 3,
            type: 'Slack',
            date: new Date(),
            channels: 5,
            users: 13,
            status: 'failed',
            log: 'Download log'
        }
    ];

    const adminHeader = () => (
        <AdminHeader className={`admin-console__migrate-header ${toBackButton ? 'with-back' : ''}`}>
            <>
                {toBackButton && <BlockableLink
                    to='/admin_console/billing/payment_info'
                    className='fa fa-angle-left back'
                />}
                <FormattedMessage
                    id='admin.cloud.migrate.home.title'
                    defaultMessage='Import a Workspace'
                />
                <Badge
                    className='BetaBadge'
                    show={true}
                >
                    <FormattedMessage
                        id='admin.cloud.migrate.home.BetaBadge'
                        defaultMessage='Beta'
                    />
                </Badge>
            </>
        </AdminHeader>
    );

    return (
        <div className='wrapper--fixed MigrateWorkspace'>
            {adminHeader()}
            <div className='admin-console__wrapper'>
                <div className='MigrateWorkspace__topWrapper'>
                    <CloudCard className='ImportCard'>
                        <div className='ImportCard__importImg'>
                            <ImportSvg />
                        </div>
                        <FormattedMessage
                                id='admin.cloud.migrate.importCard.title'
                                defaultMessage='Import {chatService} Workspace'
                                values={{chatService}}
                        />
                        <FormattedMessage
                                id='admin.cloud.migrate.importCard.description'
                                defaultMessage='You’ll need an exported ZIP file with your workspace data ready to go. '
                        />
                    <button
                    >
                        <FormattedMessage
                            id='admin.cloud.migrate.importCard.buttonText'
                            defaultMessage='Start a new import'
                        />
                    </button>
                    </CloudCard>
                    <CloudCard className='GetHelpCard'>
                        <FormattedMessage
                            id='admin.cloud.migrate.getHelpWithImporting.title'
                            defaultMessage='Get help with importing'
                        />
                        <FormattedMessage
                            id='admin.cloud.migrate.getHelpWithImporting.description'
                            defaultMessage='Review the guides below for help with importing workspace data..'
                        />
                        <a
                            target='_new'
                            rel='noopener noreferrer'
                            href={CloudLinks.EXPORTING_DATA}
                            className='Migration__GetHelp__exporting-data'
                            onClick={() => trackEvent('cloud_admin', 'click_exporting_data_info_pages', {screen: 'migrate_workspace'})}
                        >
                            <FormattedMessage
                                id='admin.cloud.migrate.getHelpWithImporting.exportingWorkspace'
                                defaultMessage='Exporting {chatService} Workspace data'
                                values={{chatService}}
                            />
                        </a>
                        <a
                            target='_new'
                            rel='noopener noreferrer'
                            href={CloudLinks.IMPORTING_DATA}
                            className='Migration__GetHelp__exporting-data'
                            onClick={() => trackEvent('cloud_admin', 'click_exporting_data_info_pages', {screen: 'migrate_workspace'})}
                        >
                            <FormattedMessage
                                id='admin.cloud.migrate.getHelpWithImporting.importingWorkspace'
                                defaultMessage='Importing {chatService} Workspace data'
                                values={{chatService}}
                            />
                        </a>
                    </CloudCard>
                </div>
                {importListSection(importListData)}
            </div>
        </div>
    );
};

const importListSection = (importListData: any) => (
    (importListData && importListData.length > 1) && 
    <CloudCard className='ImportListCard'>
        <header>
            <FormattedMessage
                id='admin.cloud.migrate.importListSection.title'
                defaultMessage='Your Imports'
            />
            <FormattedMessage
                id='admin.cloud.migrate.importListSection.description'
                defaultMessage='Below is a list of imports in progress or completed.'
            />
        </header>
        {importsListTable(importListData)}
    </CloudCard>
)

const importsListTable = (importListData: any) => (
    <>
        <table className='MigrateWorkspace__table'>
            <tr className='MigrateWorkspace__table-header'>
                <th>
                    <FormattedMessage
                        id='admin.cloud.migrate.type'
                        defaultMessage='Import Type'
                    />
                </th>
                <th>
                    <FormattedMessage
                        id='admin.cloud.migrate.date'
                        defaultMessage='Date'
                    />
                </th>
                <th>
                    <FormattedMessage
                        id='admin.cloud.migrate.channels'
                        defaultMessage='Channels'
                    />
                </th>
                <th>
                    <FormattedMessage
                        id='admin.cloud.migrate.users'
                        defaultMessage='Users'
                    />
                </th>
                <th>
                    <FormattedMessage
                        id='admin.cloud.migrate.status'
                        defaultMessage='Status'
                    />
                </th>
                <th>
                    <FormattedMessage
                        id='admin.cloud.migrate.log'
                        defaultMessage='Log'
                    />
                </th>
                <th>{''}</th>
            </tr>
            {importListData.map((importElement: any) => {
                const chatService = importElement.type
                    return (
                        <tr
                            className='MigrateWorkspace__table-row'
                            key={importElement.id}
                        >
                            <td>
                                <div className='MigrateWorkspace__table-importType'>
                                    <FormattedMarkdownMessage
                                        id='admin.cloud.migrate.tableType'
                                        defaultMessage='{chatService} Import'
                                        values={{
                                            chatService,
                                        }}
                                    />
                                </div>
                            </td>
                            <td>
                                <FormattedDate
                                    value={new Date(importElement.period_start)}
                                    month='2-digit'
                                    day='2-digit'
                                    year='numeric'
                                    timeZone='UTC'
                                />
                            </td>
                            <td>
                                <div className='MigrateWorkspace__table-bottomDesc'>
                                    {importElement.channels}
                                </div>
                            </td>
                            <td>
                                <div className='MigrateWorkspace__table-bottomDesc'>
                                    {importElement.users}
                                </div>
                            </td>
                            <td>
                                <div className='MigrateWorkspace__table-bottomDesc'>
                                    {statusLegend(importElement.status)}
                                </div>
                            </td>
                            <td>
                                <div className='MigrateWorkspace__table-bottomDesc'>
                                    {downloadLogLink(importElement.log)}
                                </div>
                            </td>   
                        </tr>
                    );
                })}
        </table>
    </>
);

const statusLegend = (status: string) => {
    switch (status) {
    case 'failed':
        return (
            <div className='admin-console__migrate-importStatus failed'>
                <i className='icon icon-alert-outline'/>
                <FormattedMessage
                    id='admin.cloud.migrate.importStatus.failed'
                    defaultMessage='Failed'
                />
            </div>
        );
    case 'completed':
        return (
            <div className='admin-console__migrate-importStatus completed'>
                <i className='icon icon-check-circle-outline'/>
                <FormattedMessage
                    id='admin.cloud.migrate.importStatus.completed'
                    defaultMessage='Completed'
                />
            </div>
        );
    default:
        return (
            <div className='admin-console__migrate-importStatus in_progress'>
                <i className='icon fa fa-refresh fa-spin'/>
                <FormattedMessage
                    id='admin.cloud.migrate.importStatus.inProgress'
                    defaultMessage='In Progress'
                />
            </div>
        );
    }
};

const downloadLogLink = (url: string) => (
    <a
        target='_new'
        rel='noopener noreferrer'
        href={url}
        className='download_log'
    >
        Download Log
    </a>
)

export default MigrateWorkspace;
