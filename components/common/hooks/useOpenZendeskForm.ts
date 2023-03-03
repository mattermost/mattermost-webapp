// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useSelector} from 'react-redux';

import {getCloudCustomer} from 'mattermost-redux/selectors/entities/cloud';
import {goToCloudSupportForm} from 'utils/contact';

export function useOpenCloudZendeskSupportForm(subject: string) {
    const customer = useSelector(getCloudCustomer);
    const customerEmail = customer?.email || '';

    return () => goToCloudSupportForm(customerEmail, subject, window.location.host);
}
