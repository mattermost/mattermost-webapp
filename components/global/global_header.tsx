// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import styled from 'styled-components';

import {getGlobalHeaderEnabled} from 'selectors/global_header';
import StatusDropdown from 'components/status_dropdown';

import ProductSwitcher from './product_switcher';

const HeaderContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 40px;
    background: var(--sidebar-teambar-bg);
`;

const AppSpectificContent = styled.div`
    flex-grow: 1;
`;

const ProfileWrapper = styled.div`
    margin-right: 20px;
`;

const GlobalHeader = () => {
    const enabled = useSelector(getGlobalHeaderEnabled);

    if (!enabled) {
        return null;
    }

    return (
        <HeaderContainer>
            <ProductSwitcher/>
            <AppSpectificContent/>
            <ProfileWrapper>
                <StatusDropdown
                    globalHeader={true}
                />
            </ProfileWrapper>
        </HeaderContainer>
    );
};

export default GlobalHeader;
