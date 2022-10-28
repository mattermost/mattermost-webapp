// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {RefObject, useEffect, useState} from 'react';
import classNames from 'classnames';
import {FormattedDate, FormattedMessage, FormattedNumber, FormattedTime} from 'react-intl';

import {ClientLicense} from '@mattermost/types/config';

import {Client4} from 'mattermost-redux/client';

import {getRemainingDaysFromFutureTimestamp, toTitleCase} from 'utils/utils';
import {FileTypes, LicenseSkus, OverActiveUserLimits} from 'utils/constants';

import Badge from 'components/widgets/badges/badge';

import './enterprise_edition.scss';

export interface EnterpriseEditionProps {
    openEELicenseModal: () => void;
    upgradedFromTE: boolean;
    license: ClientLicense;
    isTrialLicense: boolean;
    handleRemove: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
    isDisabled: boolean;
    removing: boolean;
    fileInputRef: RefObject<HTMLInputElement>;
    handleChange: () => void;
    statsActiveUsers: number;
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

const EnterpriseEditionLeftPanel = ({
    openEELicenseModal,
    upgradedFromTE,
    license,
    isTrialLicense,
    handleRemove,
    isDisabled,
    removing,
    fileInputRef,
    handleChange,
    statsActiveUsers,
}: EnterpriseEditionProps) => {
    const [unsanitizedLicense, setUnsanitizedLicense] = useState(license);
    useEffect(() => {
        async function fetchUnSanitizedLicense() {
            // This solves this the issue reported here: https://mattermost.atlassian.net/browse/MM-42906
            try {
                const unsanitizedL = await Client4.getClientLicenseOld();
                setUnsanitizedLicense(unsanitizedL);
            // eslint-disable-next-line no-empty
            } catch {}
        }
        fetchUnSanitizedLicense();
    }, [license]);

    const skuName = getSkuDisplayName(unsanitizedLicense.SkuShortName, unsanitizedLicense.IsGovSku === 'true');
    const expirationDays = getRemainingDaysFromFutureTimestamp(parseInt(unsanitizedLicense.ExpiresAt, 10));
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
                        unsanitizedLicense,
                        isTrialLicense,
                        handleRemove,
                        isDisabled,
                        removing,
                        skuName,
                        fileInputRef,
                        handleChange,
                        statsActiveUsers,
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

type LegendValues = 'START DATE:' | 'EXPIRES:' | 'USERS:' | 'ACTIVE USERS:' | 'EDITION:' | 'LICENSE ISSUED:' | 'NAME:' | 'COMPANY / ORG:'

const renderLicenseValues = (activeUsers: number, seatsPurchased: number) => ({legend, value}: {legend: LegendValues; value: string | JSX.Element | null}, index: number): React.ReactNode => {
    if (legend === 'ACTIVE USERS:') {
        const minimumOverSeats = Math.ceil(seatsPurchased * OverActiveUserLimits.MIN) + seatsPurchased;
        const maximumOverSeats = Math.ceil(seatsPurchased * OverActiveUserLimits.MAX) + seatsPurchased;
        const isBetween5PercerntAnd10PercentPurchasedSeats = minimumOverSeats <= activeUsers && activeUsers < maximumOverSeats;
        const isOver10PercerntPurchasedSeats = maximumOverSeats <= activeUsers;
        return (
            <div
                className='item-element'
                key={value + index.toString()}
            >
                <span
                    className={classNames({
                        legend: true,
                        'legend--warning-overage-purchased': isBetween5PercerntAnd10PercentPurchasedSeats,
                        'legend--overage-purchased': isOver10PercerntPurchasedSeats,
                    })}
                >{legend}</span>
                <span
                    className={classNames({
                        value: true,
                        'value--warning-overage-purchased': isBetween5PercerntAnd10PercentPurchasedSeats,
                        'value--overage-purchased': isOver10PercerntPurchasedSeats,
                    })}
                >{value}</span>
            </div>
        );
    }

    return (
        <div
            className='item-element'
            key={value + index.toString()}
        >
            <span className='legend'>{legend}</span>
            <span className='value'>{value}</span>
        </div>
    );
};

const renderLicenseContent = (
    license: ClientLicense,
    isTrialLicense: boolean,
    handleRemove: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>,
    isDisabled: boolean,
    removing: boolean,
    skuName: string,
    fileInputRef: RefObject<HTMLInputElement>,
    handleChange: () => void,
    statsActiveUsers: number,
) => {
    // Note: DO NOT LOCALISE THESE STRINGS. Legally we can not since the license is in English.

    const sku = license.SkuShortName ? <>{`Mattermost ${toTitleCase(skuName)}${isTrialLicense ? ' License Trial' : ''}`}</> : null;

    const users = <FormattedNumber value={parseInt(license.Users, 10)}/>;
    const activeUsers = <FormattedNumber value={statsActiveUsers}/>;
    const startsAt = <FormattedDate value={new Date(parseInt(license.StartsAt, 10))}/>;
    const expiresAt = <FormattedDate value={new Date(parseInt(license.ExpiresAt, 10))}/>;

    const issued = (
        <>
            <FormattedDate value={new Date(parseInt(license.IssuedAt, 10))}/>
            {' '}
            <FormattedTime value={new Date(parseInt(license.IssuedAt, 10))}/>
        </>
    );

    const licenseValues: Array<{
        legend: LegendValues;
        value: string;
    } | {
        legend: LegendValues;
        value: JSX.Element | null;
    }> = [
        {legend: 'START DATE:', value: startsAt},
        {legend: 'EXPIRES:', value: expiresAt},
        {legend: 'USERS:', value: users},
        {legend: 'ACTIVE USERS:', value: activeUsers},
        {legend: 'EDITION:', value: sku},
        {legend: 'LICENSE ISSUED:', value: issued},
        {legend: 'NAME:', value: license.Name},
        {legend: 'COMPANY / ORG:', value: license.Company},
    ];

    return (
        <div className='licenseElements'>
            {licenseValues.map(renderLicenseValues(statsActiveUsers, parseInt(license.Users, 10)))}
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
