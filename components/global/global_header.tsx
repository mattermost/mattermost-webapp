// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import {useSelector} from 'react-redux';

import {Link} from 'react-router-dom';

import * as Utils from 'utils/utils.jsx';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {getGlobalHeaderEnabled} from 'selectors/global_header';

const HeaderContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 40px;
    background: var(--sidebar-teambar-bg);
`;

const SwitcherButton = styled.button`
    margin-left: 17px;
    background-color: transparent;
    border: none;
    outline: none;
`;

const SwitchTo = styled.div`
    height: 32px;
    padding-left: 20px;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
`;

const StyledMenu = styled(Menu)`
    margin-left: 12px;
`;

const MenuItem = styled(Link)`
    && {
        text-decoration: none;
        color: inherit;
    }
    
    height: 40px;
    width: 273px;
    padding-left: 16px;
    padding-right: 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
    
    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
        text-decoration: none;
        color: inherit;
    }
`;

const MenuItemTextContainer = styled.div`
    margin-left: 8px;
    flex-grow: 1;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
`;

const LinkIcon = styled.i`
    width: 14px;
    height: 14px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
`;

const AppSpectificContent = styled.div`
    flex-grow: 1;
`;

const GlobalHeader = () => {
    const enabled = useSelector(getGlobalHeaderEnabled);

    if (!enabled) {
        return null;
    }

    return (
        <HeaderContainer>
            <MenuWrapper>
                <SwitcherButton>
                    <SwitcherIcon/>
                </SwitcherButton>
                <StyledMenu
                    id={'globalSwitcher'}
                    ariaLabel={Utils.localizeMessage('global_header.global_switcher', 'Global Switcher')}
                >
                    <SwitchTo>{'Switch to...'}</SwitchTo>
                    <MenuItem
                        to={'/'}
                    >
                        <ChannelsIcon/>
                        <MenuItemTextContainer>
                            {'Channels'}
                        </MenuItemTextContainer>
                        <LinkIcon className='fa fa-external-link'/>
                    </MenuItem>
                </StyledMenu>
            </MenuWrapper>
            <AppSpectificContent/>
        </HeaderContainer>
    );
};

const ChannelsIcon = () => {
    return (
        <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M9.89999 16.8C14.3735 16.8 18 13.7108 18 9.9C18 6.08924 14.3735 3 9.89999 3C5.42648 3 1.79999 6.08924 1.79999 9.9C1.79999 12.2671 3.19927 14.3558 5.33165 15.5987L5.33165 18.0626C5.33165 18.3023 5.5688 18.466 5.75977 18.358L8.65831 16.7194C9.0631 16.7725 9.47777 16.8 9.89999 16.8ZM16.5 19.5723C13.0728 19.5723 10.2945 17.2056 10.2945 14.2862C10.2945 11.3667 13.0728 9 16.5 9C19.9272 9 22.7055 11.3667 22.7055 14.2862C22.7055 16.0997 21.6334 17.7 19.9996 18.6521V20.4139C19.9996 20.6536 19.7625 20.8173 19.5715 20.7093L17.4511 19.5106C17.141 19.5513 16.8234 19.5723 16.5 19.5723Z'
                fill='blue'
            />
        </svg>
    );
};

const SwitcherIcon = () => {
    return (
        <svg
            width='14'
            height='13'
            viewBox='0 0 14 13'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M9.98828 12.5618H13.0117V9.53833H9.98828V12.5618ZM9.98828 8.06177H13.0117V5.03833H9.98828V8.06177ZM5.48828 3.56177H8.51172V0.53833H5.48828V3.56177ZM9.98828 3.56177H13.0117V0.53833H9.98828V3.56177ZM5.48828 8.06177H8.51172V5.03833H5.48828V8.06177ZM0.988281 8.06177H4.01172V5.03833H0.988281V8.06177ZM0.988281 12.5618H4.01172V9.53833H0.988281V12.5618ZM5.48828 12.5618H8.51172V9.53833H5.48828V12.5618ZM0.988281 3.56177H4.01172V0.53833H0.988281V3.56177Z'
                fill='white'
                fillOpacity='0.64'
            />
        </svg>
    );
};

export default GlobalHeader;
