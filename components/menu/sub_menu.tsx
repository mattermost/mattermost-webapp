// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, useState, MouseEvent} from 'react';
import {Menu, MenuList, MenuItem} from '@mui/material';
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
                    <div>
                        {props.anchorNode}
                    </div>
                    <ArrowForwardIosIcon size={18}/>
                </>
            </MenuItemAnchor>
            <Menu
                id={props.menuId}
                anchorEl={anchorElement}
                open={isSubMenuOpen}
                aria-label={props.menuAriaLabel}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                style={{pointerEvents: 'none'}} // disables the menu background wrapper
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
