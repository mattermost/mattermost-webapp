// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {isAdmin} from 'mattermost-redux/utils/user_utils';
import {isCurrentLicenseCloud, getSubscriptionProduct as selectSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';
import {CloudProducts} from 'utils/constants';
import useGetUsage from 'components/common/hooks/useGetUsage';
import {fallbackStarterLimits} from 'utils/limits';

const StyledDiv = styled.div`
width: 100%;
`;

const StyledA = styled.a`
color: rgba(var(--denim-button-bg-rgb, 1)) !important;
`;

const InnerDiv = styled.div`
display: flex;
gap: 8px;
border-radius: 4px;
background-color: rgba(var(--center-channel-text-rgb), 0.04);
padding: 10px;
margin: 10px;
color: rgba(var(--center-channel-text-rgb), 0.72);
font-weight: 400;
font-size: 11px;
line-height: 16px;
letter-spacing: 0.02em;
`;

type Props = {
    searchType: string;
}

const FILES_SEARCH_TYPE = 'files';
const MESSAGES_SEARCH_TYPE = 'messages';

function SearchLimitsBanner(props: Props) {
    const {formatMessage} = useIntl();
    const openPricingModal = useOpenPricingModal();
    const usage = useGetUsage();
    const isAdminUser = isAdmin(useSelector(getCurrentUser).roles);
    const isCloud = useSelector(isCurrentLicenseCloud);
    const product = useSelector(selectSubscriptionProduct);
    const isStarter = product?.sku === CloudProducts.STARTER;

    if (!isCloud || !isStarter) {
        return null;
    }

    const currentFileStorageUsage = usage.files.totalStorage;
    const currentMessagesUsage = usage.messages.history;
    if ((currentFileStorageUsage >= fallbackStarterLimits.files.totalStorage) || currentMessagesUsage >= fallbackStarterLimits.messages.history) {
        return null;
    }

    let ctaAction = formatMessage({
        id: 'workspace_limits.search_limit.view_plans',
        defaultMessage: 'View plans',
    });

    if (isAdminUser) {
        ctaAction = formatMessage({
            id: 'workspace_limits.search_limit.upgrade_now',
            defaultMessage: 'Upgrade now',
        });
    }

    let bannerText;

    switch (props.searchType) {
    case FILES_SEARCH_TYPE:
        bannerText = formatMessage({
            id: 'workspace_limits.search_files_limit.banner_text',
            defaultMessage: 'Some older files may not be shown because your workspace has met its file storage limit of {storage}GB. <a>{ctaAction}</a>',
        }, {
            ctaAction,
            storage: 10,
            a: (chunks: React.ReactNode | React.ReactNodeArray) => (
                <StyledA
                    onClick={openPricingModal}
                >
                    {chunks}
                </StyledA>
            ),
        });
        break;

    case MESSAGES_SEARCH_TYPE:
        bannerText = formatMessage({
            id: 'workspace_limits.search_message_limit.banner_text',
            defaultMessage: 'Some older messages may not be shown because your workspace has over {messages} messages. <a>{ctaAction}</a>',
        }, {
            ctaAction,
            messages: 10000,
            a: (chunks: React.ReactNode | React.ReactNodeArray) => (
                <StyledA
                    onClick={openPricingModal}
                >
                    {chunks}
                </StyledA>
            ),
        });
        break;
    default:
        break;
    }

    return (
        <StyledDiv id='search_limits_banner'>
            <InnerDiv>
                <i className='icon-eye-off-outline'/>
                <span>{bannerText}</span>
            </InnerDiv>
        </StyledDiv>
    );
}

export default SearchLimitsBanner;
