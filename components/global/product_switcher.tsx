// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import IconButton from '@mattermost/compass-components/components/icon-button';
import Shape from '@mattermost/compass-components/foundations/shape';
import Flex from '@mattermost/compass-components/utilities/layout/Flex';
import Popover from '@mattermost/compass-components/utilities/popover/Popover';
import Spacing from '@mattermost/compass-components/utilities/spacing';
import React, {useRef, useState} from 'react';
import {Link, useRouteMatch} from 'react-router-dom';
import styled from 'styled-components';

import {useProducts} from './hooks';

// interface SwitcherButtonProps {
//     open: boolean;
// }
//
// const SwitcherButton = styled.button<SwitcherButtonProps>`
//     margin-left: 17px;
//     margin-right: 17px;
//     background: ${(props) => (props.open ? 'var(--sidebar-text)' : 'transparent')};
//     fill: ${(props) => (props.open ? 'var(--button-bg)' : 'rgba(var(--sidebar-header-text-color-rgb), 0.64)')};
//     border: none;
//     border-radius: 4px;
//     outline: none;
//     width: 28px;
//     height: 28px;
// `;
//
// interface SwitcherMenuProps {
//     open: boolean;
// }
//
// const SwitcherMenu = styled.div<SwitcherMenuProps>`
//     visibility: ${(props) => (props.open ? 'visible' : 'hidden')};
//     position: absolute;
//     top: 35px;
//     left: 5px;
//     margin-left: 12px;
//     z-index: 1000;
//     background: var(--center-channel-bg);
//     display: flex;
//     flex-direction: column;
//     width: 273px;
//     border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
//     box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.12);
//     border-radius: 4px;
//     padding-top: 14px;
//     padding-bottom: 5px;
//     color: var(--center-channel-color);
// `;
//
// const SwitcherMenuDescriptiveText = styled.div`
//     height: 32px;
//     padding-left: 20px;
//     font-weight: 600;
//     font-size: 14px;
//     line-height: 20px;
// `;

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

const ProductSwitcher = (): JSX.Element => {
    const products = useProducts();
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const menuRef = useRef(null);

    const handleClick = () => setSwitcherOpen(!switcherOpen);

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
        <>
            <IconButton
                icon={'view-grid-outline'}
                onClick={handleClick}
                ref={menuRef}
                size={'sm'}
                toggled={switcherOpen}
            />
            <Popover
                anchorReference={menuRef}
                isVisible={switcherOpen}
                onClickAway={() => setSwitcherOpen(false)}
                placement={'bottom-start'}
                offset={[25, 25]}
            >
                <Shape
                    elevation={1}
                    elevationOnHover={6}
                    width={200}
                >
                    <Flex
                        padding={Spacing.all(50)}
                    >
                        {items}
                    </Flex>
                </Shape>
            </Popover>
        </>
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
