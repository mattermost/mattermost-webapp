// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {RefObject} from 'react';

import {FormattedMessage, FormattedNumber} from 'react-intl';

import {ClientLicense} from 'mattermost-redux/types/config';
import {LicenseSkus} from 'mattermost-redux/types/general';

import {getRemainingDaysFromFutureTimestamp, toTitleCase} from 'utils/utils';
import {FileTypes} from 'utils/constants';

import Badge from 'components/widgets/badges/badge';

import './enterprise_edition.scss';

export interface EnterpriseEditionProps {
    openEELicenseModal: () => void;
    upgradedFromTE: boolean;
    license: ClientLicense;
    isTrialLicense: boolean;
    issued: JSX.Element;
    startsAt: JSX.Element;
    expiresAt: JSX.Element;
    handleRemove: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
    isDisabled: boolean;
    removing: boolean;
    fileInputRef: RefObject<HTMLInputElement>;
    handleChange: () => void;
}

export const getSkuDisplayName = (skuShortName: string, isGovSku: boolean): string => {
    let skuName = '';
    switch (skuShortName) {
    case LicenseSkus.E20:
        skuName = 'Enterprise E20';
        break;
    case LicenseSkus.E10:
        skuName = 'Enterprise E10';
        break;
    case LicenseSkus.Professional:
        skuName = 'Professional';
        break;
    case LicenseSkus.Starter:
        skuName = 'Starter';
        break;
    default:
        skuName = 'Enterprise';
        break;
    }

    skuName += isGovSku ? ' Gov' : '';

    return skuName;
};

const EnterpriseEditionLeftPanel: React.FC<EnterpriseEditionProps> = ({
    openEELicenseModal,
    upgradedFromTE,
    license,
    isTrialLicense,
    issued,
    startsAt,
    expiresAt,
    handleRemove,
    isDisabled,
    removing,
    fileInputRef,
    handleChange,
}: EnterpriseEditionProps) => {
    const skuName = getSkuDisplayName(license.SkuShortName, license.IsGovSku === 'true');
    const expirationDays = getRemainingDaysFromFutureTimestamp(parseInt(license.ExpiresAt, 10));
    return (
        <div className='EnterpriseEditionLeftPanel'>
            <div className='pre-title'>
                <FormattedMessage
                    id='admin.license.enterpriseEdition'
                    defaultMessage='Enterprise Edition'
                />
            </div>
            <div className='title'>
                {`Mattermost ${skuName}`}{freeTrialBadge(isTrialLicense)}
            </div>
            <div className='subtitle'>
                <FormattedMessage
                    id='admin.license.enterpriseEdition.subtitle'
                    defaultMessage='This is an Enterprise Edition for the Mattermost {skuName} plan'
                    values={{skuName}}
                />
            </div>
            <div className='licenseInformation'>
                <div className='license-details-top'>
                    <span className='title'>{'License details'}</span>
                    {(expirationDays <= 30) &&
                        <span className='expiration-days'>
                            {`Expires in ${expirationDays} day${expirationDays > 1 ? 's' : ''}`}
                        </span>
                    }
                </div>
                {
                    renderLicenseContent(
                        license,
                        isTrialLicense,
                        issued,
                        startsAt,
                        expiresAt,
                        handleRemove,
                        isDisabled,
                        removing,
                        skuName,
                        fileInputRef,
                        handleChange,
                    )
                }
            </div>
            <div className='license-notices'>
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
        </div>
    );
};

const renderLicenseContent = (
    license: ClientLicense,
    isTrialLicense: boolean,
    issued: JSX.Element,
    startsAt: JSX.Element,
    expiresAt: JSX.Element,
    handleRemove: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>,
    isDisabled: boolean,
    removing: boolean,
    skuName: string,
    fileInputRef: RefObject<HTMLInputElement>,
    handleChange: () => void,
) => {
    // Note: DO NOT LOCALISE THESE STRINGS. Legally we can not since the license is in English.

    const sku = license.SkuShortName ? <>{`Mattermost ${toTitleCase(skuName)}${isTrialLicense ? ' License Trial' : ''}`}</> : null;

    const users = <FormattedNumber value={parseInt(license.Users, 10)}/>;

    const licenseValues: Array<{
        legend: string;
        value: string;
    } | {
        legend: string;
        value: JSX.Element | null;
    }> = [
        {legend: 'START DATE:', value: startsAt},
        {legend: 'EXPIRES:', value: expiresAt},
        {legend: 'USERS:', value: users},
        {legend: 'EDITION:', value: sku},
        {legend: 'LICENSE ISSUED:', value: issued},
        {legend: 'NAME:', value: license.Name},
        {legend: 'COMPANY / ORG:', value: license.Company},
    ];

    return (
        <div className='licenseElements'>
            {licenseValues.map((item: {legend: string; value: JSX.Element | null | string}, i: number) => {
                return (
                    <div
                        className='item-element'
                        key={item.value + i.toString()}
                    >
                        <span className='legend'>{item.legend}</span>
                        <span className='value'>{item.value}</span>
                    </div>
                );
            })}
            <hr/>
            {renderAddNewLicenseButton(fileInputRef, handleChange)}
            {renderRemoveButton(handleRemove, isDisabled, removing)}
        </div>
    );
};

const renderAddNewLicenseButton = (
    fileInputRef: RefObject<HTMLInputElement>,
    handleChange: () => void,
) => {
    return (
        <>
            <button
                className='add-new-licence-btn'
                onClick={() => fileInputRef.current?.click()}
            >
                <FormattedMessage
                    id='admin.license.keyAddNew'
                    defaultMessage='Add a new license'
                />
            </button>
            <input
                ref={fileInputRef}
                type='file'
                accept={FileTypes.LICENSE_EXTENSION}
                onChange={handleChange}
                style={{display: 'none'}}
            />
        </>
    );
};

const renderRemoveButton = (
    handleRemove: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>,
    isDisabled: boolean,
    removing: boolean,
) => {
    let removeButtonText = (
        <FormattedMessage
            id='admin.license.keyRemove'
            defaultMessage='Remove License and Downgrade Server'
        />
    );
    if (removing) {
        removeButtonText = (
            <FormattedMessage
                id='admin.license.removing'
                defaultMessage='Removing License...'
            />
        );
    }

    return (
        <>
            <div className='remove-button'>
                <button
                    type='button'
                    className='btn btn-danger'
                    onClick={handleRemove}
                    disabled={isDisabled}
                    id='remove-button'
                    data-testid='remove-button'
                >
                    {removeButtonText}
                </button>
            </div>
        </>
    );
};

const freeTrialBadge = (isTrialLicense: boolean) => {
    if (!isTrialLicense) {
        return null;
    }

    return (
        <Badge className='free-trial-license'>
            <FormattedMessage
                id='admin.license.Trial'
                defaultMessage='Trial'
            />
        </Badge>
    );
};

export default React.memo(EnterpriseEditionLeftPanel);
