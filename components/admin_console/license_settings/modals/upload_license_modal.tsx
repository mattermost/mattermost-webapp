// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {FormattedDate, FormattedMessage} from 'react-intl';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {uploadLicense} from 'mattermost-redux/actions/admin';
import {getLicenseConfig} from 'mattermost-redux/actions/general';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {ClientLicense} from 'mattermost-redux/types/config';
import {getCurrentLocale} from 'selectors/i18n';

import {GlobalState} from 'types/store';

import {isModalOpen} from 'selectors/views/modals';

import GenericModal from 'components/generic_modal';
import WomanArmOnTable from 'components/common/svg_images_components/woman_arm_on_table_svg';
import HandsSvg from 'components/common/svg_images_components/hands_svg';
import FileSvg from 'components/common/svg_images_components/file_svg';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';

import {ModalIdentifiers} from 'utils/constants';

import {closeModal} from 'actions/views/modals';

import {localizeMessage} from 'utils/utils';
import {getMonthLong} from 'utils/i18n';

import './upload_license_modal.scss';

type Props = {
    onExited?: () => void;
}

const UploadLicenseModal: React.FC<Props> = (props: Props): JSX.Element | null => {
    const dispatch = useDispatch<DispatchFunc>();

    const [fileSelected, setFileSelected] = useState(false);
    const [fileObj, setFileObj] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [serverError, setServerError] = useState<string | null>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentLicense: ClientLicense = useSelector(getLicense);
    const locale = useSelector(getCurrentLocale);

    const handleChange = () => {
        const element = fileInputRef.current;
        if (element === null || element.files === null || element.files.length === 0) {
            return;
        }
        setFileSelected(true);
        setFileObj(element.files[0]);
        setServerError(null);
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (fileObj === null) {
            return;
        }

        setIsUploading(true);
        const {error} = await dispatch(uploadLicense(fileObj));

        if (error) {
            setFileSelected(false);
            setFileObj(null);
            setServerError(error.message);
            setIsUploading(false);
            return;
        }

        await dispatch(getLicenseConfig());
        setFileSelected(false);
        setFileObj(null);
        setServerError(null);
        setIsUploading(false);
    };

    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.UPLOAD_LICENSE));
    if (!show) {
        return null;
    }

    const handleOnClose = () => {
        if (props.onExited) {
            props.onExited();
        }
        dispatch(closeModal(ModalIdentifiers.UPLOAD_LICENSE));
    };

    const handleRemoveFile = () => {
        setFileObj(null);
        setFileSelected(false);
    };

    let uploadLicenseContent = (
        <>
            <div className='content-body'>
                <div className='svg-image'>
                    <WomanArmOnTable
                        width={200}
                        height={200}
                    />
                </div>
                <div className='title'>
                    <FormattedMessage
                        id='admin.license.upload-modal.title'
                        defaultMessage='Upload a License Key'
                    />
                </div>
                <div className='subtitle'>
                    <FormattedMessage
                        id='admin.license.upload-modal.subtitle'
                        defaultMessage='Upload a license key for Mattermost Enterprise Edition to upgrade this server. '
                    />
                </div>
                <div className='file-upload'>
                    <div className='file-upload__titleSection'>
                        <FormattedMessage
                            id='admin.license.upload-modal.file'
                            defaultMessage='File'
                        />
                    </div>
                    <div className='file-upload__inputSection'>
                        <div className='help-text file-name-section'>
                            {fileSelected ? (
                                <>
                                    <FileSvg
                                        width={20}
                                        height={20}
                                    />
                                    <span className='file-name'>
                                        {fileObj?.name && fileObj?.name.length < 40 ? fileObj?.name : `${fileObj?.name.substr(0, 37)}...`}
                                    </span>
                                    <span className='file-size'>
                                        {fileObj?.size && (fileObj?.size / 1024).toFixed(2) + 'MB'}
                                    </span>
                                </>
                            ) : (
                                <FormattedMessage
                                    id='admin.license.no-file-selected'
                                    defaultMessage='No file selected'
                                />
                            )}
                        </div>
                        <div className='file__upload'>
                            {fileSelected ? (
                                <a
                                    onClick={handleRemoveFile}
                                >
                                    <FormattedMessage
                                        id='admin.license.remove'
                                        defaultMessage='Remove'
                                    />
                                </a>
                            ) : (
                                <>
                                    <input
                                        ref={fileInputRef}
                                        type='file'
                                        accept='.mattermost-license'
                                        onChange={handleChange}
                                    />
                                    <a
                                        className='btn-select'
                                    >
                                        <FormattedMessage
                                            id='admin.license.choose'
                                            defaultMessage='Choose File'
                                        />
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className='serverError'>
                    {serverError && <i className='icon icon-alert-outline'/>}
                    {serverError}
                </div>
            </div>
            <div className='content-footer'>
                <div className='btn-upload-wrapper'>
                    <button
                        className={`btn ${fileSelected && 'btn-primary'}`}
                        disabled={!fileSelected}
                        onClick={handleSubmit}
                        id='upload-button'
                    >
                        <LoadingWrapper
                            loading={Boolean(isUploading)}
                            text={localizeMessage('admin.license.modal.uploading', 'Uploading')}
                        >
                            <FormattedMessage
                                id='admin.license.modal.upload'
                                defaultMessage='Upload'
                            />
                        </LoadingWrapper>
                    </button>
                </div>
            </div>
        </>
    );
    if (currentLicense.IsLicensed === 'true') {
        const startsAt = (
            <FormattedDate
                value={new Date(parseInt(currentLicense.StartsAt, 10))}
                day='2-digit'
                month={getMonthLong(locale)}
                year='numeric'
            />
        );
        const expiresAt = (
            <FormattedDate
                value={new Date(parseInt(currentLicense.ExpiresAt, 10))}
                day='2-digit'
                month={getMonthLong(locale)}
                year='numeric'
            />
        );

        const licensedUsersNum = currentLicense.Users;
        uploadLicenseContent = (
            <>
                <div className='content-body'>
                    <div className='svg-image hands-svg'>
                        <HandsSvg
                            width={100}
                            height={100}
                        />
                    </div>
                    <div className='title'>
                        <FormattedMessage
                            id='admin.license.upload-modal.successfulUpgrade'
                            defaultMessage='Successful Upgrade!'
                        />
                    </div>
                    <div className='subtitle'>
                        <FormattedMessage
                            id='admin.license.upload-modal.successfulUpgradeText'
                            defaultMessage='You have upgraded to the Starter plan for {licensedUsersNum} users. This is effective from {startsAt} until {expiresAt}. '
                            values={{
                                expiresAt,
                                startsAt,
                                licensedUsersNum,
                            }}
                        />
                    </div>
                </div>
                <div className='content-footer'>
                    <div className='btn-upload-wrapper'>
                        <button
                            className='btn btn-primary'
                            onClick={handleOnClose}
                            id='done-button'
                        >
                            <FormattedMessage
                                id='admin.license.modal.done'
                                defaultMessage='Done'
                            />
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <GenericModal
            className={'UploadLicenseModal'}
            show={show}
            id='UploadLicenseModal'
            onExited={handleOnClose}
        >
            {uploadLicenseContent}
        </GenericModal>
    );
};

export default UploadLicenseModal;
