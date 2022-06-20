// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {isCurrentLicenseCloud, getSubscriptionProduct as selectSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';
import Constants, {CloudProducts} from 'utils/constants';

const StyledDiv = styled.div`
width: 100%;
padding: 0 24px;
margin: 12px auto;
`;

const InnerDiv = styled.div`
position: relative;
border: 1px solid #FFBC1F;
border-radius: 4px;
background: linear-gradient(0deg, rgba(255, 212, 112, 0.16), rgba(255, 212, 112, 0.16)), #FFFFFF;
padding: 16px 17px;
color: var(--center-channel-color);
`;

const CloseIcon = styled.button`
border: none;
outline: none;
background: none;
position: absolute;
top: 16px;
right: 17px;
`;

const StyledI = styled.i`
color: #FFBC1F;
`;

function FileLimitStickyBanner() {
    const {formatMessage} = useIntl();

    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const isCloud = useSelector(isCurrentLicenseCloud);
    const product = useSelector(selectSubscriptionProduct);
    const isStarter = product?.sku === CloudProducts.STARTER;

    if (!isCloud || !isStarter) {
        return null;
    }

    const AdminMessageLink = (
        <a>{formatMessage({id: 'create_post.file_limit_sticky_banner.admin_link_message', defaultMessage: 'upgrade to a paid plan.'})}</a>
    );

    const NonAdminMessageLink = (
        <a>{formatMessage({id: 'create_post.file_limit_sticky_banner.non_admin_link_message', defaultMessage: 'notify your admin to upgrade to a paid plan.'})}</a>
    );

    const AdminMessage = (
        <span>
            {formatMessage({
                id: 'create_post.file_limit_sticky_banner.admin_message',
                defaultMessage: 'Your free plan is limited to {storageGB}GB of files. New uploads will automatically archive older files. To view them again, you can delete older files or '},
            {
                storageGB: '10',
            },
            )}
            {AdminMessageLink}
        </span>
    );

    const NonAdminMessage = (
        <span>
            {formatMessage({
                id: 'create_post.file_limit_sticky_banner.non_admin_message',
                defaultMessage: 'Your free plan is limited to {storageGB}GB of files. New uploads will automatically archive older files. To view them again, '},
            {
                storageGB: '10',
            },
            )}
            {NonAdminMessageLink}
        </span>
    );

    const tooltip = (
        <Tooltip id='file_limit_banner_snooze'>
            {formatMessage({id: 'create_post.file_limit_sticky_banner.snooze_tooltip', defaultMessage: 'Snooze for {snoozeDays} days'}, {snoozeDays: '10'})}
        </Tooltip>
    );

    return (
        <StyledDiv>
            <InnerDiv>
                <StyledI
                    className='icon-alert-outline'
                />
                {isAdmin ? AdminMessage : NonAdminMessage}

                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={tooltip}
                >
                    <CloseIcon>
                        <i className='icon icon-close'/>
                    </CloseIcon>
                </OverlayTrigger>
            </InnerDiv>
        </StyledDiv>
    );
}

export default FileLimitStickyBanner;
