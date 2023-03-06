// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useIntl} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';

import {
    TELEMETRY_CATEGORIES,
} from 'utils/constants';
import useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';

export default function ContactSalesLink() {
    const [, contactSalesLink] = useOpenSalesLink();
    const intl = useIntl();
    return (
        <a
            className='footer-text'
            onClick={() => {
                trackEvent(
                    TELEMETRY_CATEGORIES.SELF_HOSTED_PURCHASING,
                    'click_contact_sales',
                );
            }}
            href={contactSalesLink}
            target='_blank'
            rel='noopener noreferrer'
        >
            {intl.formatMessage({id: 'self_hosted_signup.contact_sales', defaultMessage: 'Contact Sales'})}
        </a>
    );
}
