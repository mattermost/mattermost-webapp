// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useSelector} from 'react-redux';

import {getCloudCustomer} from 'mattermost-redux/selectors/entities/cloud';
import {getSelfHostedSupportLink, goToCloudSupportForm, goToSelfHostedSupportForm} from 'utils/contact_support_sales';

export function useOpenCloudZendeskSupportForm(subject: string, description: string) {
    const customer = useSelector(getCloudCustomer);
    const customerEmail = customer?.email || '';

    return () => goToCloudSupportForm(customerEmail, subject, description, window.location.host);
}

export function useOpenSelfHostedZendeskSupportForm(subject: string): [() => void, string] {
    const customerEmail = '';

    const url = getSelfHostedSupportLink(customerEmail, subject);

    return [() => goToSelfHostedSupportForm(customerEmail, subject), url];
}
