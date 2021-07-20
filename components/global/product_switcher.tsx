// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {Link, useRouteMatch} from 'react-router-dom';
import styled from 'styled-components';

import {ChannelsIcon, SwitcherIcon} from './assets';
import {useClickOutsideRef, useProducts} from './hooks';

interface SwitcherButtonProps {
    open: boolean;
}

const SwitcherButton = styled.button<SwitcherButtonProps>`
    margin-left: 17px;
    margin-right: 17px;
    background: ${(props) => (props.open ? 'var(--sidebar-text)' : 'transparent')};
    fill: ${(props) => (props.open ? 'var(--button-bg)' : 'rgba(var(--sidebar-header-text-color-rgb), 0.64)')};
    border: none;
    border-radius: 4px;
    outline: none;
    width: 28px;
    height: 28px;
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
    color: var(--center-channel-color);
`;

const SwitcherMenuDescriptiveText = styled.div`
    height: 32px;
    padding-left: 20px;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
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

const ProductSwitcher = () => {
    const products = useProducts();
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    useClickOutsideRef(menuRef, () => {
        setSwitcherOpen(false);
    });

    const items = products?.map((product) => {
        return (
            <SwitcherNavEntry
                key={product.id}
                destination={product.switcherLinkURL}
                icon={product.switcherIcon}
                text={product.switcherText}
            />
        );
    });

    return (
        <div ref={menuRef}>
            <SwitcherButton
                open={switcherOpen}
                onClick={() => setSwitcherOpen(!switcherOpen)}
            >
                <SwitcherIcon/>
            </SwitcherButton>
            <SwitcherMenu
                open={switcherOpen}
            >
                <SwitcherMenuDescriptiveText>
                    <FormattedMessage
                        defaultMessage='Open...'
                        id='global_header.open'
                    />
                </SwitcherMenuDescriptiveText>
                <SwitcherNavEntry
                    destination={'/channels'}
                    icon={<ChannelsIcon/>}
                    text={'Channels'}
                />
                {items}
            </SwitcherMenu>
        </div>
    );
};

interface SwitcherNavEntryProps {
    destination: string;
    icon: React.ReactNode;
    text: React.ReactNode;
}

const SwitcherNavEntry = (props: SwitcherNavEntryProps) => {
    const match = useRouteMatch(props.destination);
    return (
        <MenuItem
            to={props.destination}
            target='_blank'
        >
            {props.icon}
            <MenuItemTextContainer>
                {props.text}
            </MenuItemTextContainer>
            <LinkIcon className={'fa ' + (match ? 'fa-check' : 'fa-external-link')}/>
        </MenuItem>
    );
};

export default ProductSwitcher;
