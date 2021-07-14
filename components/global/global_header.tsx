// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import styled from 'styled-components';

import {useSelector} from 'react-redux';

import {Link, useRouteMatch} from 'react-router-dom';

import {FormattedMessage} from 'react-intl';

import {GlobalState} from 'types/store';
import {getGlobalHeaderEnabled} from 'selectors/global_header';
import {GlobalHeaderSwitcherPluginComponent} from 'types/store/plugins';
import StatusDropdown from 'components/status_dropdown';

const HeaderContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 40px;
    background: var(--sidebar-teambar-bg);
`;

interface SwitcherButtonProps {
    open: boolean;
}

const SwitcherButton = styled.button<SwitcherButtonProps>`
    margin-left: 17px;
    background: ${(props) => (props.open ? 'var(--sidebar-text)' : 'transparent')};
    fill: ${(props) => (props.open ? 'var(--button-bg)' : 'rgba(var(--sidebar-header-text-color-rgb), 0.64)')};
    border: none;
    border-radius: 4px;
    outline: none;
    width: 28px;
    height: 28px;
`;

const Open = styled.div`
    height: 32px;
    padding-left: 20px;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
`;

interface SwitcherMenuProps {
    open: boolean;
}

const SwitcherMenu = styled.div<SwitcherMenuProps>`
    visibility: ${(props) => (props.open ? 'visible' : 'hidden')};
    position: absolute;
    top: 35px;
    left: 5px;
    margin-left: 12px;
    z-index: 1000;
    background: var(--center-channel-bg);
    display: flex;
    flex-direction: column;
    width: 273px;
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    padding-top: 14px;
    padding-bottom: 5px;
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

const selectSwitcherItems = (state: GlobalState) => state.plugins.components.GlobalHeaderSwitcherItem;

const ProfileWrapper = styled.div`
    margin-right: 20px;
`;

const GlobalHeader = () => {
    const switcherItems = useSelector<GlobalState, GlobalHeaderSwitcherPluginComponent[]>(selectSwitcherItems);
    const enabled = useSelector(getGlobalHeaderEnabled);
    const [switcherOpen, setSwitcherOpen] = useState(false);

    if (!enabled) {
        return null;
    }

    const items = switcherItems?.map((item) => {
        if (!item || !item.linkURL || !item.icon || !item.text) {
            return null;
        }
        return (
            <SwitcherNavEntry
                key={item.id}
                destination={item.linkURL}
                icon={item.icon}
                text={item.text}
            />
        );
    });
    return (
        <HeaderContainer>
            <SwitcherButton
                open={switcherOpen}
                onClick={() => setSwitcherOpen(!switcherOpen)}
            >
                <SwitcherIcon/>
            </SwitcherButton>
            <SwitcherMenu open={switcherOpen}>
                <Open>
                    <FormattedMessage
                        defaultMessage='Open...'
                        id='global_header.open'
                    />
                </Open>
                <SwitcherNavEntry
                    destination={'/'}
                    icon={<ChannelsIcon/>}
                    text={'Channels'}
                />
                {items}
            </SwitcherMenu>
            <AppSpectificContent/>
            <ProfileWrapper>
                <StatusDropdown
                    globalHeader={true}
                />
            </ProfileWrapper>
        </HeaderContainer>
    );
};

interface SwitcherNavEntryProps {
    destination: string;
    icon: React.ReactNode;
    text: React.ReactNode;
}

const SwitcherNavEntry = (props: SwitcherNavEntryProps) => {
    const match = useRouteMatch(props.destination);
    const isPlug = useRouteMatch('/plug/');
    let active = Boolean(match);
    if (props.destination === '/') {
        active = active && !isPlug;
    }
    return (
        <MenuItem
            to={props.destination}
            target='_blank'
        >
            {props.icon}
            <MenuItemTextContainer>
                {props.text}
            </MenuItemTextContainer>
            <LinkIcon className={'fa ' + (active ? 'fa-check' : 'fa-external-link')}/>
        </MenuItem>
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
            fill='inherit'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M9.98828 12.5618H13.0117V9.53833H9.98828V12.5618ZM9.98828 8.06177H13.0117V5.03833H9.98828V8.06177ZM5.48828 3.56177H8.51172V0.53833H5.48828V3.56177ZM9.98828 3.56177H13.0117V0.53833H9.98828V3.56177ZM5.48828 8.06177H8.51172V5.03833H5.48828V8.06177ZM0.988281 8.06177H4.01172V5.03833H0.988281V8.06177ZM0.988281 12.5618H4.01172V9.53833H0.988281V12.5618ZM5.48828 12.5618H8.51172V9.53833H5.48828V12.5618ZM0.988281 3.56177H4.01172V0.53833H0.988281V3.56177Z'
                fill='inherit'
            />
        </svg>
    );
};

export default GlobalHeader;
