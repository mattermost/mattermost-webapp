// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';

import {Client4} from 'mattermost-redux/client';
import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';
import {
    ModalIdentifiers,
} from 'utils/constants';

import NoInternetConnection from '../no_internet_connection/no_internet_connection';

export interface RenewalLinkProps {
    actions: {
        openModal: (modalData: { modalId: string; dialogType: any; dialogProps?: any }) => void;
    };
}

const RenewalLink: React.FC<RenewalLinkProps> = (props: RenewalLinkProps) => {
    const [renewalLink, setRenewalLink] = useState('');

    useEffect(() => {
        Client4.getRenewalLink().then(({renewal_link: renewalLinkParam}) => {
            if (renewalLinkParam && (/^http[s]?:\/\//).test(renewalLinkParam)) {
                setRenewalLink(renewalLinkParam);
            }
        });
    }, []);

    const handleLinkClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        trackEvent('renew_license', 'renew_license_banner_success');
        try {
            const {status} = await Client4.ping();
            if (status === 'OK' && renewalLink !== '') {
                window.open(renewalLink, '_blank');
            } else {
                showConnetionErrorModal();
            }
        } catch (error) {
            showConnetionErrorModal();
        }
    };

    const showConnetionErrorModal = () => {
        trackEvent('renew_license', 'renew_license_banner_fail');
        props.actions.openModal({
            modalId: ModalIdentifiers.NO_INTERNET_CONNECTION,
            dialogType: NoInternetConnection,
        });
    };

    return (
        <>
            <button
                className='annnouncementBar__renewLicense'
                onClick={(e) => handleLinkClick(e)}
            >
                <FormattedMessage
                    id='announcement_bar.warn.renew_license_now'
                    defaultMessage='Renew license now'
                />
            </button>
        </>
    );
};

export default RenewalLink;
