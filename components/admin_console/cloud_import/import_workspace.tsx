// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';

import AlertBanner from 'components/alert_banner';
import BlockableLink from 'components/admin_console/blockable_link';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import AdminHeader from 'components/widgets/admin_console/admin_header';
import AdminFooter from 'components/widgets/admin_console/admin_footer';
import CardContainer from 'components/common/card_container';
import {useInterval} from 'components/common/hooks/set_interval';
import Badge from 'components/widgets/badges/badge';

import {
    CloudLinks,
} from 'utils/constants';

import importsListTable from './components/import_list';
import OpenFile from './components/open_file';
import './import_workspace.scss';
import ProgressBar from './widgets/progress_bar';
import ImportSvg from './import.svg';

// temporal hardcoded data
const importList = [{
    id: 2,
    type: 'Slack',
    date: new Date(),
    channels: 5,
    users: 13,
    status: 'in_progress',
    log: 'Download log',
},
{
    id: 1,
    type: 'Slack',
    date: new Date(),
    channels: 5,
    users: 13,
    status: 'completed',
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

const ImportWorkspace: React.FC = () => {
    const [importListData] = useState(importList);
    const [chatService] = useState('Slack');
    const [percentage, setPercentage] = useState(7);
    const [screenStep, setScreenStep] = useState(1);
    const [isImportInProgress] = useState(true);
    const [isNewWorkspace] = useState(true);

    useInterval(() => {
        setPercentage((prevPercentage) => prevPercentage + 1);
    }, 1000, 99000);

    useEffect(() => {
    }, []);

    const clickProgressBar = useCallback(() => () => {
        // temporal, this will redirect to the import in progress page
    }, []);

    const nextStepFunc: any = (): any => {
        setScreenStep((prevStep) => prevStep + 1);
    };

    const stepBackFunc: any = (): any => {
        if (screenStep > 0) {
            setScreenStep((prevStep) => prevStep - 1);
        }
    };

    const goToImportHome: any = (): any => {
        setScreenStep(0);
    };

    const adminHeader = useMemo(() => () => {
        const inProgress = (
            <FormattedMessage
                id='admin.general.importInProgress'
                defaultMessage='Import in Progress'
            />
        );
        return (
            <AdminHeader className={`admin-console__import-header ${screenStep > 0 ? 'with-back' : ''}`}>
                <>
                    {screenStep !== 0 &&
                    <BlockableLink
                        onClick={() => stepBackFunc()}
                        to='#'
                        className='fa fa-angle-left back'
                    />}
                    <FormattedMessage
                        id='admin.cloud.import.header.title'
                        defaultMessage='Import a Workspace'
                    />
                    <Badge
                        className='BetaBadge'
                        show={true}
                    >
                        <FormattedMessage
                            id='admin.cloud.import.header.BetaBadge'
                            defaultMessage='Beta'
                        />
                    </Badge>
                    {/* this probably sgo to the shared admin header and the state to the main redux store*/}
                    {showImportInProgressHeaderChip() &&
                        <ProgressBar
                            percentage={percentage}
                            title={inProgress}
                            width={50}
                            showPercentageTex={true}
                            clickProgressBar={clickProgressBar}
                        />
                    }
                </>
            </AdminHeader>
        );
    }, [screenStep]);

    const adminFooter = useMemo(() => () => {
        return (
            <AdminFooter className={'importFooter'}>
                <>
                    <button
                        className='nextStep'
                        onClick={() => nextStepFunc()}
                    >
                        <FormattedMessage
                            id='admin.cloud.import.footer.nextStep'
                            defaultMessage='Next Step'
                        />
                    </button>
                    <button
                        className='cancel buttonAsLink'
                        onClick={() => goToImportHome()}
                    >
                        <FormattedMessage
                            id='admin.cloud.import.footer.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                </>
            </AdminFooter>
        );
    }, []);

    const showImportInProgressHeaderChip = () => {
        return true;
    };

    const showImportInProgressAlertBanner = () => {
        return screenStep === 0 && isImportInProgress;
    };

    const showImportRecommendedForNewWorkspacesAlertBanner = () => {
        return screenStep === 0 && isNewWorkspace;
    };

    const importInProgressBanner = (
        <AlertBanner
            mode='info'
            title={
                <FormattedMessage
                    id='admin.cloud.import.importInProgress.banner.title'
                    defaultMessage='Import in progress'
                />
            }
            message={
                <>
                    <FormattedMarkdownMessage
                        id='admin.cloud.import.importInProgress.banner.description'
                        defaultMessage='New imports are disabled until this import is complete. You may continue using Mattermost while the import progresses and we will email you once the import is complete.'
                    />
                    <a
                        target='_new'
                        rel='noopener noreferrer'
                        href={CloudLinks.BILLING_DOCS}
                        className='importInProgress'
                    >
                        <FormattedMessage
                            id='admin.cloud.import.importInProgress.banner.link'
                            defaultMessage='View in-progress import'
                        />
                    </a>
                </>
            }
        />
    );

    const importRecommendedForNewWorkspacesBanner = (
        <AlertBanner
            mode='info'
            title={
                <FormattedMessage
                    id='admin.cloud.import.recommended4NewWorkspaces.banner.title'
                    defaultMessage='Importing is recommended for new workspaces'
                />
            }
            message={
                <FormattedMarkdownMessage
                    id='admin.cloud.import.recommended4NewWorkspaces.banner.description'
                    defaultMessage='It looks like your workspace has quite a bit of data in it already. While this feature is in Beta, it is recommended for new workspaces. If you wish to continue, there is a risk that conflicting data may cause problems.'
                />
            }
            onDismiss={() => (true)}
        />
    );

    return (
        <div className='wrapper--fixed ImportWorkspace'>
            {adminHeader()}
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    {showImportInProgressAlertBanner() && importInProgressBanner}
                    {showImportRecommendedForNewWorkspacesAlertBanner() && importRecommendedForNewWorkspacesBanner}
                    <div className='ImportWorkspace__topWrapper'>
                        {openFileComponent(screenStep === 1, chatService, nextStepFunc)}
                        {zeroState((screenStep === 0), chatService, nextStepFunc)}
                    </div>
                    {screenStep === 0 && importListSection(importListData, percentage)}
                </div>
            </div>
            {screenStep !== 0 && adminFooter()}
        </div>
    );
};

// temporaly passing the percentage here. Once we define how the UI is aware of the import in progress, we will define the right way to draw that in the table
const importListSection = (importListData: any, percentage: number) => (
    (importListData && importListData.length >= 1) &&
    <CardContainer className='ImportListCard'>
        <header>
            <FormattedMessage
                id='admin.cloud.import.importListSection.title'
                defaultMessage='Your Imports'
            />
            <FormattedMessage
                id='admin.cloud.import.importListSection.description'
                defaultMessage='Below is a list of imports in progress or completed.'
            />
        </header>
        {importsListTable(importListData, percentage)}
    </CardContainer>
);

const openFileComponent = (showOpenFile: boolean, chatService: string, nextStepFunc: () => void) => {
    return showOpenFile && (
        <OpenFile
            chatService={chatService}
            nextStepFunc={nextStepFunc}
            maxFreeUsers={10}
        />
    );
};

const zeroState = (showZeroState: boolean, chatService: string, startNewImport: any) => {
    return showZeroState && (
        <>
            <CardContainer className='ImportCard'>
                <div className='ImportCard__importImg'>
                    <ImportSvg/>
                </div>
                <FormattedMessage
                    id='admin.cloud.import.importCard.title'
                    defaultMessage='Import {chatService} Workspace'
                    values={{chatService}}
                />
                <FormattedMessage
                    id='admin.cloud.import.importCard.description'
                    defaultMessage='You’ll need an exported ZIP file with your workspace data ready to go. '
                />
                <button onClick={() => startNewImport()}>
                    <FormattedMessage
                        id='admin.cloud.import.importCard.buttonText'
                        defaultMessage='Start a new import'
                    />
                </button>
            </CardContainer>
            <CardContainer className='GetHelpCard'>
                <FormattedMessage
                    id='admin.cloud.import.getHelpWithImporting.title'
                    defaultMessage='Get help with importing'
                />
                <FormattedMessage
                    id='admin.cloud.import.getHelpWithImporting.description'
                    defaultMessage='Review the guides below for help with importing workspace data..'
                />
                <a
                    target='_new'
                    rel='noopener noreferrer'
                    href={CloudLinks.EXPORTING_DATA}
                    className='Import__GetHelp__exporting-data'
                    onClick={() => trackEvent('cloud_admin', 'click_exporting_data_info_pages', {screen: 'import_workspace'})}
                >
                    <FormattedMessage
                        id='admin.cloud.import.getHelpWithImporting.exportingWorkspace'
                        defaultMessage='Exporting {chatService} Workspace data'
                        values={{chatService}}
                    />
                </a>
                <a
                    target='_new'
                    rel='noopener noreferrer'
                    href={CloudLinks.IMPORTING_DATA}
                    className='Import__GetHelp__exporting-data'
                    onClick={() => trackEvent('cloud_admin', 'click_exporting_data_info_pages', {screen: 'import_workspace'})}
                >
                    <FormattedMessage
                        id='admin.cloud.import.getHelpWithImporting.importingWorkspace'
                        defaultMessage='Importing {chatService} Workspace data'
                        values={{chatService}}
                    />
                </a>
            </CardContainer>
        </>
    );
};

export default ImportWorkspace;
