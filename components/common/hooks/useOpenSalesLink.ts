// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useSelector} from 'react-redux';

import {getCloudCustomer} from 'mattermost-redux/selectors/entities/cloud';
import {LicenseLinks} from 'utils/constants';
import {goToCloudSupportForm} from 'utils/contact';

export default function useOpenSalesLink(): [() => void, string] {
    // const contactSalesLink = useSelector(getCloudContactUsLink)(inquireType, issue);
    const contactSalesLink = LicenseLinks.CONTACT_SALES;
    const goToSalesLinkFunc = () => {
        window.open(contactSalesLink, '_blank');
    };
    return [goToSalesLinkFunc, contactSalesLink];
}

export function useOpenCloudZendeskSupportForm(subject: string) {
    const customer = useSelector(getCloudCustomer);
    const customerEmail = customer?.email || '';

    return () => goToCloudSupportForm(customerEmail, subject, window.location.host);
}
