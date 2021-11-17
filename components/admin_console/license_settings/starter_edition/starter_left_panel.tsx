// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {FormattedMessage} from 'react-intl';

import Markdown from 'components/markdown/markdown';

import './starter_edition.scss';
export interface StarterEditionProps {
    openEELicenseModal: () => void;
    currentPlan: JSX.Element;
    upgradedFromTE: boolean;
    serverError: string | null;
    fileSelected: boolean;
    fileName: string | null;
    uploading: boolean;
    fileInputRef: any;
    isDisabled: boolean;
    handleChange: () => void;
    handleSubmit: (e: any) => Promise<void>;
}

const StarterLeftPanel: React.FC<StarterEditionProps> = ({
    openEELicenseModal,
    currentPlan,
    upgradedFromTE,
    serverError,
    fileSelected,
    fileName,
    uploading,
    fileInputRef,
    isDisabled,
    handleChange,
    handleSubmit,
}: StarterEditionProps) => {
    return (
        <div className='StarterLeftPanel'>
            <div className='pre-title'>
                <FormattedMessage
                    id='admin.license.enterpriseEdition'
                    defaultMessage='Enterprise Edition'
                />
            </div>
            <div className='title'>
                <FormattedMessage
                    id='admin.license.starterEdition.title'
                    defaultMessage='Starter'
                />
            </div>
            <div className='currentPlanLegend'>
                {currentPlan}
            </div>
            <div className='subtitle'>
                <FormattedMessage
                    id='admin.license.starterEdition.subtitle'
                    defaultMessage='Purchase Professional or Enterprise to unlock enterprise fatures.'
                />
            </div>
            <hr/>
            <div className='content'>
                {upgradedFromTE ? <>
                    <p>
                        {'When using Mattermost Enterprise Edition, the software is offered under a commercial license. See '}
                        <a
                            role='button'
                            onClick={openEELicenseModal}
                            className='openEELicenseModal'
                        >
                            {'here'}
                        </a>
                        {' for “Enterprise Edition License” for details. '}
                        {'See NOTICE.txt for information about open source software used in the system.'}
                    </p>
                </> : <p>
                    {'This software is offered under a commercial license.\n\nSee ENTERPRISE-EDITION-LICENSE.txt in your root install directory for details. See NOTICE.txt for information about open source software used in this system.'}
                </p>
                }
            </div>
            <div className='licenseInformation'>
                {
                    renderStarterContent(
                        serverError,
                        fileSelected,
                        fileName,
                        uploading,
                        fileInputRef,
                        isDisabled,
                        handleChange,
                        handleSubmit,
                    )
                }
            </div>
        </div>
    );
};

const renderStarterContent = (
    _serverError: string | null,
    fileSelected: boolean,
    _fileName: string | null,
    uploading: boolean,
    fileInputRef: any,
    isDisabled: boolean,
    handleChange: () => void,
    handleSubmit: (e: any) => Promise<void>,
) => {
    let serverError: JSX.Element | null = null;
    if (_serverError) {
        serverError = (
            <div className='has-error'>
                <Markdown
                    enableFormatting={true}
                    message={_serverError}
                />
            </div>
        );
    }

    let btnClass = '';
    if (fileSelected) {
        btnClass = 'btn-primary';
    }

    let fileName;
    if (_fileName) {
        fileName = _fileName;
    } else {
        fileName = (
            <FormattedMessage
                id='admin.license.noFile'
                defaultMessage='No file uploaded'
            />
        );
    }

    let uploadButtonText = (
        <FormattedMessage
            id='admin.license.upload'
            defaultMessage='Upload'
        />
    );
    if (uploading) {
        uploadButtonText = (
            <FormattedMessage
                id='admin.license.uploading'
                defaultMessage='Uploading License...'
            />
        );
    }
    return (
        <>
            <div
                className='licenseKeyTitle'
            >
                <FormattedMessage
                    id='admin.license.key'
                    defaultMessage='License Key: '
                />
            </div>
            <div className='uploadButtons'>
                <div className='file__upload'>
                    <button
                        type='button'
                        className='btn btn-primary btn-select'
                    >
                        <FormattedMessage
                            id='admin.license.choose'
                            defaultMessage='Choose File'
                        />
                    </button>
                    <input
                        ref={fileInputRef}
                        type='file'
                        accept='.mattermost-license'
                        onChange={handleChange}
                        disabled={isDisabled}
                    />
                </div>
                <button
                    className={`btn btn-upload ${btnClass}`}
                    disabled={isDisabled || !fileSelected}
                    onClick={handleSubmit}
                    id='upload-button'
                >
                    {uploadButtonText}
                </button>
                <div className='help-text'>
                    {fileName}
                </div>
                <br/>
                <div className='serverError'>
                    {serverError}
                </div>
            </div>
        </>
    );
};

export default React.memo(StarterLeftPanel);
