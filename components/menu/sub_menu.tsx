// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, useState, MouseEvent} from 'react';
import {Menu, MenuList, MenuItem, PopoverOrigin} from '@mui/material';
import styled from 'styled-components';

import {ArrowForwardIosIcon} from '@mattermost/compass-icons/components';

interface Props {

    // Anchor button props
    anchorId?: string;
    anchorNode?: ReactNode;
    anchorAriaLabel?: string;

    // Menu props
    menuId?: string;
    menuAriaLabel?: string;
    openAt?: 'right' | 'left';

    children: ReactNode;

}

export function SubMenu(props: Props) {
    const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
    const isSubMenuOpen = Boolean(anchorElement);

    const handleSubMenuOpen = (event: MouseEvent<HTMLLIElement>) => {
        event.preventDefault();
        setAnchorElement(event.currentTarget);
    };

    const handleSubMenuClose = (event: MouseEvent<HTMLLIElement>) => {
        event.preventDefault();
        setAnchorElement(null);
    };

    const hasSubmenuItems = Boolean(props.children);
    if (!hasSubmenuItems) {
        return null;
    }

    return (
        <MenuItem
            id={props.anchorId}
            aria-controls={isSubMenuOpen ? props.menuId : undefined}
            aria-haspopup='true'
            aria-expanded={isSubMenuOpen ? 'true' : undefined}
            aria-label={props.anchorAriaLabel}
            disableRipple={true}
            onMouseEnter={handleSubMenuOpen}
            onMouseLeave={handleSubMenuClose}
        >
            <MenuItemAnchor>
                <>
                    {props.anchorNode}
                    <ArrowForwardIosIcon
                        size={16}
                        color='currentColor'
                    />
                </>
            </MenuItemAnchor>
            <Menu
                id={props.menuId}
                anchorEl={anchorElement}
                open={isSubMenuOpen}
                aria-label={props.menuAriaLabel}
                style={{pointerEvents: 'none'}} // disables the menu background wrapper
                {...getOriginOfAnchorAndTransform(props.openAt)}
            >
                <MenuList
                    aria-labelledby={props.anchorId}
                    style={{pointerEvents: 'auto'}} // reset pointer events to default from here on
                >
                    {props.children}
                </MenuList>
            </Menu>
        </MenuItem>

    );
}

const MenuItemAnchor = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    & > div {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-direction: row;
    }
`;

function getOriginOfAnchorAndTransform(openAt = 'right'): {anchorOrigin: PopoverOrigin; transformOrigin: PopoverOrigin} {
    if (openAt === 'left') {
        return {
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'left',
            },
            transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
            },
        };
    }

    return {
        anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
        },
        transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
        },
    };
}
