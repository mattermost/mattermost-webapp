// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import {useIntl} from 'react-intl';

import StartTrialBtn from 'components/learn_more_trial_modal/start_trial_btn';
import useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';

import {isAdmin} from 'mattermost-redux/utils/user_utils';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getPrevTrialLicense} from 'mattermost-redux/actions/admin';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {checkHadPriorTrial, isCurrentLicenseCloud, getSubscriptionProduct as selectSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';
import {getBrowserTimezone} from 'utils/timezone';

import {CloudProducts, LicenseLinks, LicenseSkus} from 'utils/constants';

import CloudStartTrialButton from 'components/cloud_start_trial/cloud_start_trial_btn';

import {GlobalState} from '@mattermost/types/store';

function ADLDAPUpsellBanner() {
    const [show, setShow] = useState(true);
    const [confirmed, setConfirmed] = useState(false);

    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const openSalesLink = useOpenSalesLink();

    useEffect(() => {
        dispatch(getPrevTrialLicense());
    }, []);

    const isAdminUser = isAdmin(useSelector(getCurrentUser).roles);
    const isCloud = useSelector(isCurrentLicenseCloud);
    const currentLicense = useSelector(getLicense);
    const prevTrialLicense = useSelector((state: GlobalState) => state.entities.admin.prevTrialLicense);
    const product = useSelector(selectSubscriptionProduct);

    const prevCloudTrialed = useSelector(checkHadPriorTrial);
    const prevSelfHostedTrialed = prevTrialLicense?.IsLicensed === 'true';
    const prevTrialed = prevSelfHostedTrialed || prevCloudTrialed;

    const isSelfHostedProfessional = currentLicense?.SkuShortName === LicenseSkus.Professional;
    const isCloudProfessional = product?.sku === CloudProducts.PROFESSIONAL;
    const isProfessional = isSelfHostedProfessional || isCloudProfessional;

    if (!show) {
        return null;
    }

    const currentLicenseEndDate = new Date(parseInt(currentLicense?.ExpiresAt, 10));

    const openLink = () => {
        if (isCloud) {
            openSalesLink();
        } else {
            window.open(LicenseLinks.CONTACT_SALES, '_blank');
        }
    };

    const confirmBanner = (
        <div className='ad_ldap_upsell_confirm'>
            <div className='upsell-confirm-backdrop'/>
            <div className='upsell-confirm-foreground'>
                <p className='title'>{formatMessage({id: 'adldap_upsell_banner.confirm.title', defaultMessage: 'Your trial has started!'})}</p>
                <p className='subtitle'>{formatMessage({id: 'adldap_upsell_banner.confirm.license_trial', defaultMessage: 'Welcome to your Mattermost Enterprise trial! It expires on {endDate}. You now have access to high-security Enterprise features, for free.'}, {endDate: moment(currentLicenseEndDate).tz(getBrowserTimezone()).format('MMMM Do YYYY')})}</p>
                <div className='btns-container'>
                    <button
                        className='confrim-btn learn-more'
                        onClick={openLink}
                    >
                        {formatMessage({id: 'adldap_upsell_banner.confirm.learn_more', defaultMessage: 'Learn more'})}
                    </button>
                    <button
                        className='confrim-btn continue'
                        onClick={() => setShow(false)}
                    >
                        {formatMessage({id: 'adldap_upsell_banner.confirm.continue', defaultMessage: 'Continue'})}
                    </button>
                </div>
            </div>
        </div>
    );

    if (confirmed) {
        return confirmBanner;
    }

    if (!isAdminUser) {
        return null;
    }

    if (!isProfessional) {
        return null;
    }

    let btn = (
        <StartTrialBtn
            btnClass='ad-ldap-banner-btn'
            message={formatMessage({id: 'adldap_upsell_banner.trial_btn', defaultMessage: 'Try free for 30 days'})}
            telemetryId={'start_self-hosted_trial_from_adldap_upsell_banner'}
            renderAsButton={true}
            onClick={() => setConfirmed(true)}
        />);

    if (isCloud) {
        btn = (
            <CloudStartTrialButton
                extraClass='ad-ldap-banner-btn'
                message={formatMessage({id: 'adldap_upsell_banner.trial_btn', defaultMessage: 'Try free for 30 days'})}
                telemetryId={'start_cloud_trial_from_adldap_upsell_banner'}
                onClick={() => setConfirmed(true)}
            />
        );
    }

    if (prevTrialed) {
        btn = (
            <button
                className='ad-ldap-banner-btn'
                onClick={openLink}
            >
                {formatMessage({id: 'adldap_upsell_banner.sales_btn', defaultMessage: 'Contact sales to use'})}
            </button>
        );
    }

    return (
        <div
            id='ad_ldap_upsell_banner'
            className='ad_ldap_upsell_banner'
        >
            <div className='message'>
                <i className='icon icon-information-outline'/>
                {formatMessage({id: 'adldap_upsell_banner.banner_message', defaultMessage: 'AD/LDAP group sync creates groups faster'})}
            </div>
            <div className='btn-container'>
                {btn}
                <button
                    type='button'
                    aria-label='Close'
                    className='banner-close'
                    onClick={() => setShow(false)}
                >
                    <span aria-hidden='true'>{'×'}</span>
                    <span className='sr-only'>{'Close'}</span>
                </button>
            </div>
        </div>
    );
}

export default ADLDAPUpsellBanner;
