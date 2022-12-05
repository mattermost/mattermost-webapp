// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, useState, MouseEvent} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';
import {Menu as MuiMenu, MenuList as MuiMenuList, MenuItem as MuiMenuItem, PopoverOrigin} from '@mui/material';

import {ArrowForwardIosIcon} from '@mattermost/compass-icons/components';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {getIsMobileView} from 'selectors/views/browser';

import {openModal, closeModal} from 'actions/views/modals';

import CompassDesignProvider from 'components/compass_design_provider';
import GenericModal from 'components/generic_modal';

interface Props {

    // Anchor button props
    triggerId?: string;
    triggerElement?: ReactNode;
    triggerAriaLabel?: string;

    // Menu props
    menuId: string;
    menuAriaLabel?: string;
    openAt?: 'right' | 'left';

    children: ReactNode;

}

export function SubMenu(props: Props) {
    const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
    const isSubMenuOpen = Boolean(anchorElement);

    const isMobileView = useSelector(getIsMobileView);

    const theme = useSelector(getTheme);

    const dispatch = useDispatch();

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

    if (isMobileView) {
        function MenuModalComponent() {
            function handleModalExited() {
                dispatch(closeModal(props.menuId));
            }

            function handleModalClickCapture() {
                handleModalExited();
            }

            return (
                <CompassDesignProvider theme={theme}>
                    <GenericModal
                        id={props.menuId}
                        ariaLabel={props.menuAriaLabel}
                        onExited={handleModalExited}
                        backdrop={true}
                        className='menuModal'
                    >
                        <MuiMenuList
                            aria-labelledby={props.triggerId}
                            onClick={handleModalClickCapture}
                        >
                            {props.children}
                        </MuiMenuList>
                    </GenericModal>
                </CompassDesignProvider>
            );
        }

        function handleAnchorButtonClickOnMobile(event: MouseEvent<HTMLLIElement>) {
            event.preventDefault();

            dispatch(openModal({
                modalId: props.menuId,
                dialogType: MenuModalComponent,
            }));
        }

        return (
            <MuiMenuItem
                id={props.triggerId}
                disableRipple={true}
                aria-controls={props.menuId}
                aria-haspopup='true'
                onClick={handleAnchorButtonClickOnMobile}
            >
                <MenuItemAnchor>
                    {props.triggerElement}
                </MenuItemAnchor>
            </MuiMenuItem>
        );
    }

    return (
        <MuiMenuItem
            id={props.triggerId}
            aria-controls={isSubMenuOpen ? props.menuId : undefined}
            aria-haspopup='true'
            aria-expanded={isSubMenuOpen ? 'true' : undefined}
            aria-label={props.triggerAriaLabel}
            disableRipple={true}
            onMouseEnter={handleSubMenuOpen}
            onMouseLeave={handleSubMenuClose}
        >
            <MenuItemAnchor>
                {props.triggerElement}
                <ArrowForwardIosIcon
                    size={16}
                    color='currentColor'
                />
            </MenuItemAnchor>
            <MuiMenu
                id={props.menuId}
                anchorEl={anchorElement}
                open={isSubMenuOpen}
                aria-label={props.menuAriaLabel}
                style={{pointerEvents: 'none'}} // disables the menu background wrapper
                {...getOriginOfAnchorAndTransform(props.openAt)}
            >
                <MuiMenuList
                    aria-labelledby={props.triggerId}
                    style={{pointerEvents: 'auto'}} // reset pointer events to default from here on
                >
                    {props.children}
                </MuiMenuList>
            </MuiMenu>
        </MuiMenuItem>

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
