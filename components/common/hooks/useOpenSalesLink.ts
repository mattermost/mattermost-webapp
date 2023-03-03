// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useSelector} from 'react-redux';

import {getCloudCustomer} from 'mattermost-redux/selectors/entities/cloud';
import {buildMMURL, goToMattermostContactSalesForm} from 'utils/contact';
import {LicenseLinks} from 'utils/constants';

export default function useOpenSalesLink(): [() => void, string] {
    const customer = useSelector(getCloudCustomer);
    const customerEmail = customer?.email || '';
    const firstName = customer?.contact_first_name || '';
    const lastName = customer?.contact_last_name || '';
    const companyName = customer?.name || '';

    const contactSalesLink = buildMMURL(LicenseLinks.CONTACT_SALES, firstName, lastName, companyName, customerEmail);
    const goToSalesLinkFunc = () => {
        goToMattermostContactSalesForm(firstName, lastName, companyName, customerEmail);
    };
    return [goToSalesLinkFunc, contactSalesLink];
}

