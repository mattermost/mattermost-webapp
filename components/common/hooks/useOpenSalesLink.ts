// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useSelector} from 'react-redux';

import {getCloudCustomer, isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {buildMMURL, goToMattermostContactSalesForm} from 'utils/contact_support_sales';
import {LicenseLinks} from 'utils/constants';

export default function useOpenSalesLink(): [() => void, string] {
    const isCloud = useSelector(isCurrentLicenseCloud);
    const customer = useSelector(getCloudCustomer);
    const currentUser = useSelector(getCurrentUser);
    let customerEmail = '';
    let firstName = '';
    let lastName = '';
    let companyName = '';

    if (isCloud && customer) {
        customerEmail = customer.email || '';
        firstName = customer.contact_first_name || '';
        lastName = customer.contact_last_name || '';
        companyName = customer.name || '';
    } else {
        customerEmail = currentUser.email || '';
    }

    const contactSalesLink = buildMMURL(LicenseLinks.CONTACT_SALES, firstName, lastName, companyName, customerEmail);
    const goToSalesLinkFunc = () => {
        goToMattermostContactSalesForm(firstName, lastName, companyName, customerEmail);
    };
    return [goToSalesLinkFunc, contactSalesLink];
}

