// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState, Dispatch, SetStateAction} from 'react';
import {FormattedMessage} from 'react-intl';

import CardContainer from 'components/common/card_container';
import {useDragAndDrop} from 'components/common/hooks/drag_and_drop';
import FileUploadOverlay from 'components/file_upload_overlay';

import {trackEvent} from 'actions/telemetry_actions';

import loadingIcon from 'images/cloud_spinner.gif';

import ChatServiceLogoCard from '../widgets/chat_service_logo_card';

import UpgradeLink from 'components/widgets/links/upgrade_link';

import {
    CloudLinks,
} from 'utils/constants';

import OpenFileImg from '../open_file.svg';

import './open_file.scss';
import FilePreview from 'components/file_preview/file_preview';
import AlertBanner from 'components/alert_banner';

export interface StepOneProps {
    chatService: string;
    nextStepFunc: () => void;
    maxFreeUsers: number;
}

const StepOne: React.FC<StepOneProps> = (props: StepOneProps) => {
    const inputFileRef = useRef<HTMLInputElement>(null);
    const chatService = props.chatService;
    const [fileValues, setFileValues] = useState('initial');
    const [showOverlay, setShowOverlay] = useState(false);

    // TODO: take this info from subscription stats
    const [isPaidTier] = useState(false);
    const [deactivateUsers, setDeactivateUsers] = useState(false);

    enum FileState {
        INITIAL,
        LOADING,
        COMPLETED
    }

    const [openFileState, setOpenFileState] = useState(FileState.INITIAL);

    const handleDropCb = (e: any) => {
        // TODO: TEMPORAL - validating and parsing a simple JSON file
        const file = e.dataTransfer.files[0];
        onFileLoaded(file);
        setShowOverlay(false);
    };

    const handleDragOverCb = () => {
        setShowOverlay(true);
    };

    const handleDragOutCb = () => {
        setShowOverlay(false);
    };

    const [dragAndDropRef] = useDragAndDrop(
        {
            handleDropCb: (e: any) => handleDropCb(e),
            handleDragOverCb,
            handleDragOutCb,
        },
    );

    const onOpenFileButtonClick = () => {
        if (inputFileRef !== null && inputFileRef.current !== null) {
            inputFileRef.current.click();
        }
    };

    const onChangeFile = (e: any) => {
        e.stopPropagation();
        e.preventDefault();
        const file = e.target.files[0];
        onFileLoaded(file);
    };

    const onReaderLoad = (e: any) => {
        const file = JSON.parse(e.target.result);
        setFileValues(file);
        setOpenFileState(FileState.COMPLETED);
    };

    const onFileLoaded = (file: any) => {
        setOpenFileState(FileState.LOADING);

        // TODO: Temporal to simulate the time loading it could take and see the screen in that state
        setTimeout(() => {
            const reader = new FileReader();
            reader.onload = onReaderLoad;
            reader.readAsText(file);
        }, 2000);
    };

    const removeFile = () => {
        setOpenFileState(FileState.INITIAL);
        setDeactivateUsers(false);
    };

    return (
        <CardContainer className='OpenFile' >
            <FileUploadOverlay
                overlayType='center'
                show={showOverlay}
            />
            <header>
                <FormattedMessage
                    id='admin.cloud.import.openFile.headerStep'
                    defaultMessage='Step 1 of 4: Select your data file'
                />
                <a
                    target='_new'
                    rel='noopener noreferrer'
                    href={CloudLinks.HELP_IMPORTING_FROM}
                    className='Import__GetHelp__importingFrom'
                    onClick={() => trackEvent('cloud_admin', 'click_help_importing_from_info_pages', {screen: 'import_workspace__open_file'})}
                >
                    <i className='icon icon-information-outline'/>
                    <FormattedMessage
                        id='admin.cloud.import.openFile.helpWithMigrating'
                        defaultMessage='Help with migrating from {chatService}'
                        values={{chatService}}
                    />
                </a>
            </header>
            {openFileState === FileState.INITIAL && openFileStateInitialSection(dragAndDropRef, onOpenFileButtonClick, inputFileRef, onChangeFile)}
            {openFileState === FileState.LOADING && fileStateLoadingSection()}
            {openFileState === FileState.COMPLETED &&
                fileStateCompletedSection(
                    fileValues,
                    chatService,
                    removeFile,
                    props.nextStepFunc,
                    props.maxFreeUsers,
                    isPaidTier,
                    deactivateUsers,
                    setDeactivateUsers)}
        </CardContainer>
    );
};

const openFileStateInitialSection = (dragAndDropRef: string | React.MutableRefObject<any>,
    onOpenFileButtonClick: () => void,
    inputFileRef: React.RefObject<HTMLInputElement>,
    onChangeFile: (e: any) => void,
) => {
    return (
        <main ref={dragAndDropRef}>
            <div className='OpenFile__openFileContent'>
                <div className='OpenFile__openFileImg'>
                    <OpenFileImg/>
                </div>
                <div className='mainDescription'>
                    <FormattedMessage
                        id='admin.cloud.import.openFile.dragAndDropHere'
                        defaultMessage='Drag and drop ZIP file or'
                    />
                    <button
                        onClick={() => onOpenFileButtonClick()}
                        className='buttonAsLink'
                    >
                        <FormattedMessage
                            id='admin.cloud.import.openFile.clickHere'
                            defaultMessage='click here'
                        />
                    </button>
                    <input
                        id='myInput'
                        type='file'
                        ref={inputFileRef}
                        onChange={(e) => onChangeFile(e)}
                    />
                </div>
                <FormattedMessage
                    id='admin.cloud.import.openFile.uploadLimit'
                    defaultMessage='Uploads are limited to 1GB'
                />
            </div>
        </main>
    );
};

const fileStateLoadingSection = () => {
    return (
        <div>
            <div className='OpenFile__loadingContainer'>
                <img
                    src={loadingIcon}
                    className='loading'
                />
            </div>
        </div>
    );
};

const fileStateCompletedSection = (
    fileValues: any,
    chatService: string,
    removeFile: () => void,
    nextStepFunc: () => void,
    maxFreeUsers: number,
    isPaidTier: boolean,
    deactivateUsers: boolean,
    setDeactivateUsers: Dispatch<SetStateAction<boolean>>) => {
    // TODO: Temporal - Hardcoded file meta-data info
    const fileInfos: any = [
        {
            create_at: 1614596846095,
            delete_at: 0,
            extension: 'json',
            id: 'cntxzcz1hjbc7yn6ep1ys4n64h',
            mime_type: 'application/json',
            mini_preview: null,
            name: 'workspace9Users.json',
            size: 67,
            update_at: 1614596846095,
            user_id: 'k85m8kiqaffcppzmweuk4h3cmo',
        },
    ];

    const usersAboveFreeTier = () => {
        return fileValues.users > maxFreeUsers;
    };

    return (
        <div className='OpenFile__openFileCompletedContent'>
            <div className='grayContainer'>
                <div className='logoAndFile'>
                    <div className='chatServiceImage'>
                        <ChatServiceLogoCard chatService={chatService}/>
                    </div>
                    <FilePreview
                        fileInfos={fileInfos}
                        onRemove={removeFile}
                        uploadsInProgress={undefined}
                        enableSVGs={false}
                    />
                </div>
                <div className='fileSummaryInfo'>
                    <div className='fileSummaryList header'>
                        <FormattedMessage
                            id='admin.cloud.import.openFile.fileSummaryList.header'
                            defaultMessage='{chatService} workspace to be imported'
                            values={{chatService}}
                        />
                    </div>
                    <div className='fileSummaryList'>
                        <FormattedMessage
                            id='admin.cloud.import.openFile.fileSummaryList.workspaceName'
                            defaultMessage='Workspace Name'
                        />
                        <span>{fileValues.workspaceName}</span>
                    </div>
                    <div className='fileSummaryList'>
                        <FormattedMessage
                            id='admin.cloud.import.openFile.fileSummaryList.users'
                            defaultMessage='Users'
                        />
                        <div className='usersPreviewInfo'>
                            <span className={usersAboveFreeTier() || deactivateUsers ? 'info' : undefined}>{fileValues.users}</span>
                            {usersAboveFreeTier() || deactivateUsers ? <i className='icon icon-information-outline'/> : null}
                            {deactivateUsers ?
                                <>
                                    <FormattedMessage
                                        id='admin.cloud.import.openFile.fileSummaryList.usersDeactivated'
                                        defaultMessage='Users will be deactivated.'
                                    />
                                    <UpgradeLink
                                        telemetryInfo='admin_cloud_import_workspace'
                                        extraClass='buttonAsLink'
                                        buttonText={
                                            <FormattedMessage
                                                id='admin.cloud.import.openFile.fileSummaryList.upgrade'
                                                defaultMessage='Upgrade'
                                            />
                                        }
                                    />
                                </> :
                                null
                            }
                        </div>
                    </div>
                    <div className='fileSummaryList'>
                        <FormattedMessage
                            id='admin.cloud.import.openFile.fileSummaryList.channels'
                            defaultMessage='Channels'
                        />
                        <span>{fileValues.channels}</span>
                    </div>
                </div>
            </div>
            {!usersAboveFreeTier() || isPaidTier || deactivateUsers ? <div className='satisfiedMessage'>
                <FormattedMessage
                    id='admin.cloud.import.openFile.completedState.satisfiedMessagePartOne'
                    defaultMessage='If you’re satisfied with the above, click'
                />
                <button
                    onClick={() => nextStepFunc()}
                    className='buttonAsLink'
                >
                    <FormattedMessage
                        id='admin.cloud.import.openFile.completedState.satisfiedMessagePartTwo'
                        defaultMessage='Next Step'
                    />
                </button>
                <FormattedMessage
                    id='admin.cloud.import.openFile.completedState.satisfiedMessagePartThree'
                    defaultMessage='to continue'
                />
            </div> : null}
            <div className='freeTierLimitBanner'>
                {usersAboveFreeTier() && !isPaidTier && !deactivateUsers && freeTierLimitBanner(setDeactivateUsers)}
            </div>
        </div>
    );
};

const freeTierLimitBanner = (setDeactivateUsers: Dispatch<SetStateAction<boolean>>) => (
    <AlertBanner
        mode='info'
        title={
            <FormattedMessage
                id='admin.cloud.import.openFile.completedState.freeTierLimitBanner.title'
                defaultMessage='The free tier is limited to 10 users'
            />
        }
        message={
            <>
                <FormattedMessage
                    id='admin.cloud.import.openFile.completedState.freeTierLimitBanner.description'
                    defaultMessage='Upgrade Mattermost Cloud for more users or continue importing your data with deactivated users.'
                />
                <div className='buttons'>
                    <UpgradeLink telemetryInfo='admin_cloud_import_workspace'/>
                    <button
                        type='button'
                        onClick={() => setDeactivateUsers(true)}
                        className='deactivateUsersForNow buttonAsLink'
                    >
                        <FormattedMessage
                            id='admin.cloud.import.openFile.completedState.freeTierLimitBanner.deactivateUsers'
                            defaultMessage='Deactivate users for now'
                        />
                    </button>
                </div>
            </>
        }
    />
);

export default StepOne;
