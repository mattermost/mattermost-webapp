// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';

import useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';

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
    const openSalesLink = useOpenSalesLink();
    return (
        <StyledDiv
            id='contact_sales_quote'
            onClick={openSalesLink}
        >
            {formatMessage({id: 'pricing_modal.btn.contactSalesForQuote', defaultMessage: 'Contact Sales for a quote'})}
        </StyledDiv>);
}

export default ContactSalesCTA;
