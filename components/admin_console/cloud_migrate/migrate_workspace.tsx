// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';

import AlertBanner from 'components/alert_banner';
import BlockableLink from 'components/admin_console/blockable_link';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import AdminHeader from 'components/widgets/admin_console/admin_header';
import CloudCard from 'components/common/cloud_card';
import {useInterval} from 'components/common/hooks/set_interval';

import {
    CloudLinks,
} from 'utils/constants';

import './migrate_workspace.scss';

import Badge from 'components/widgets/badges/badge';

import ProgressBar from './widgets/progress_bar';

import importsListTable from './components/import_list';

import ImportSvg from './import.svg';

// temporal hardcoded data
const importList = [{
    id: 1,
    type: 'Slack',
    date: new Date(),
    channels: 5,
    users: 13,
    status: 'completed',
    log: 'Download log',
},
{
    id: 2,
    type: 'Slack',
    date: new Date(),
    channels: 5,
    users: 13,
    status: 'in_progress',
    log: 'Download log',
},
{
    id: 3,
    type: 'Slack',
    date: new Date(),
    channels: 5,
    users: 13,
    status: 'failed',
    log: 'Download log',
},
];

const MigrateWorkspace: React.FC = () => {
    // const {formatMessage} = useIntl();
    // const store = useStore();
    const [importListData] = useState(importList);
    const [chatService] = useState('Slack');
    const [toBackButton] = useState('null');
    const [percentage, setPercentage] = useState(1);

    // const [step, setStep] = useState(0);

    useInterval(() => {
        setPercentage(percentage + 1);
    }, 1000);

    useEffect(() => {
    }, []);

    const adminHeader = () => (
        <AdminHeader className={`admin-console__migrate-header ${toBackButton ? 'with-back' : ''}`}>
            <>
                {toBackButton &&
                <BlockableLink
                    to='/admin_console/billing/payment_info'
                    className='fa fa-angle-left back'
                />}
                <FormattedMessage
                    id='admin.cloud.migrate.header.title'
                    defaultMessage='Import a Workspace'
                />
                <Badge
                    className='BetaBadge'
                    show={true}
                >
                    <FormattedMessage
                        id='admin.cloud.migrate.header.BetaBadge'
                        defaultMessage='Beta'
                    />
                </Badge>
                {/* this probably should go to the shared admin header and the state to the main redux store*/}
                {shouldShowImportInProgressHeaderChip() && <ProgressBar percentage={percentage}/>}
            </>
        </AdminHeader>
    );

    const shouldShowImportInProgressHeaderChip = () => {
        return true;
    };

    const shouldShowImportInProgressAlertBanner = () => {
        return true;
    };

    const shouldShowImportRecommended4NewWorkspacesAlertBanner = () => {
        return true;
    };

    const importInProgress = (
        <AlertBanner
            mode='info'
            title={
                <FormattedMessage
                    id='admin.cloud.migrate.importInProgress.banner.title'
                    defaultMessage='Import in progress'
                />
            }
            message={
                <>
                    <FormattedMarkdownMessage
                        id='admin.cloud.migrate.importInProgress.banner.description'
                        defaultMessage='New imports are disabled until this import is complete. You may continue using Mattermost while the import progresses and we will email you once the import is complete.'
                    />
                    <a
                        target='_new'
                        rel='noopener noreferrer'
                        href={CloudLinks.BILLING_DOCS}
                        className='migrationInProgress'
                    >
                        <FormattedMessage
                            id='admin.cloud.migrate.importInProgress.banner.link'
                            defaultMessage='View in-progress import'
                        />
                    </a>
                </>
            }
        />
    );

    const importRecommended4NewWorkspaces = (
        <AlertBanner
            mode='info'
            title={
                <FormattedMessage
                    id='admin.cloud.migrate.recommended4NewWorkspaces.banner.title'
                    defaultMessage='Importing is recommended for new workspaces'
                />
            }
            message={
                <FormattedMarkdownMessage
                    id='admin.cloud.migrate.recommended4NewWorkspaces.banner.description'
                    defaultMessage='It looks like your workspace has quite a bit of data in it already. While this feature is in Beta, it is recommended for new workspaces. If you wish to continue, there is a risk that conflicting data may cause problems.'
                />
            }
            onDismiss={() => (true)}
        />
    );

    return (
        <div className='wrapper--fixed MigrateWorkspace'>
            {adminHeader()}
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    {shouldShowImportInProgressAlertBanner() && importInProgress}
                    {shouldShowImportRecommended4NewWorkspacesAlertBanner() && importRecommended4NewWorkspaces}
                    <div className='MigrateWorkspace__topWrapper'>
                        <CloudCard className='ImportCard'>
                            <div className='ImportCard__importImg'>
                                <ImportSvg/>
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
                            <button >
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
);

export default MigrateWorkspace;
