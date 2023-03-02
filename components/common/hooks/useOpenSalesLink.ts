// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {LicenseLinks} from 'utils/constants';

export default function useOpenSalesLink(): [() => void, string] {
    const contactSalesLink = LicenseLinks.CONTACT_SALES;
    const goToSalesLinkFunc = () => {
        window.open(contactSalesLink, '_blank');
    };
    return [goToSalesLinkFunc, contactSalesLink];
}
