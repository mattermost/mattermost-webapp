// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';

const Span = styled.span`
font-family: 'Open Sans';
font-size: 12px;
font-style: normal;
font-weight: 600;
line-height: 16px;
`;

const StyledBtn = styled.button`
border: none;
background: none;
color: var(--denim-button-bg);
`;

function NotifyAdminCTA() {
    const {formatMessage} = useIntl();
    return (
        <div>
            <Span>{formatMessage({id: 'pricing_modal.wantToUpgrade', defaultMessage: 'Want to upgrade?'})}
                <StyledBtn>{formatMessage({id: 'pricing_modal.notifyAdmin', defaultMessage: 'Notify your admin'})}</StyledBtn>
            </Span>
        </div>);
}

export default NotifyAdminCTA;
