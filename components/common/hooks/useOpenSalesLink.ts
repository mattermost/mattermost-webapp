// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useSelector} from 'react-redux';

import {getCloudContactUsLink, InquiryType} from 'selectors/cloud';
import {GlobalState} from 'types/store';

export default function useOpenSalesLink() {
    const contactSalesLink = useSelector((state: GlobalState) => getCloudContactUsLink(state, InquiryType.Sales));

    return () => window.open(contactSalesLink, '_blank');
}

