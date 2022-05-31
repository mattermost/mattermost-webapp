// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import {GlobalState} from 'types/store';
import {getCloudContactUsLink, InquiryType} from 'selectors/cloud';

const StyledDiv = styled.div`
color: var(--denim-button-bg);
font-family: 'Open Sans';
font-size: 12px;
font-style: normal;
font-weight: 600;
line-height: 16px;
cursor: pointer;
text-align: center;
`;

function ContactSalesCTA() {
    const {formatMessage} = useIntl();
    const contactSalesLink = useSelector((state: GlobalState) => getCloudContactUsLink(state, InquiryType.Sales));
    return (
        <StyledDiv
            onClick={() => {
                window.open(contactSalesLink, '_blank');
            }}
        >
            {formatMessage({id: 'pricing_modal.btn.contactSalesForQuote', defaultMessage: 'Contact Sales for a quote'})}
        </StyledDiv>);
}

export default ContactSalesCTA;
