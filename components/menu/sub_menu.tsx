// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, useState, MouseEvent} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import MuiMenuList from '@mui/material/MenuList';
import {PopoverOrigin} from '@mui/material/Popover';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {getIsMobileView} from 'selectors/views/browser';

import {openModal, closeModal} from 'actions/views/modals';

import {A11yClassNames} from 'utils/constants';

import CompassDesignProvider from 'components/compass_design_provider';
import GenericModal from 'components/generic_modal';

import {MuiMenuStyled} from './menu_styled';
import {MenuItem, Props as MenuItemProps} from './menu_item';

interface Props extends MenuItemProps {

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
                            aria-hidden={true}
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
            <MenuItem
                aria-controls={props.menuId}
                aria-haspopup={true}
                aria-expanded={isSubMenuOpen}
                aria-label={props.triggerAriaLabel}
                disableRipple={true}
                primaryLabel={props.primaryLabel}
                secondaryLabel={props.secondaryLabel}
                leadingElement={props.leadingElement}
                trailingElement={props.trailingElement}
                subMenuDetails={props.subMenuDetails}
                onClick={handleAnchorButtonClickOnMobile}
            >
                {props.triggerElement}
            </MenuItem>
        );
    }

    return (
        <MenuItem
            aria-controls={props.menuId}
            aria-haspopup={true}
            aria-expanded={isSubMenuOpen}
            aria-label={props.triggerAriaLabel}
            disableRipple={true}
            primaryLabel={props.primaryLabel}
            secondaryLabel={props.secondaryLabel}
            leadingElement={props.leadingElement}
            trailingElement={props.trailingElement}
            subMenuDetails={props.subMenuDetails}
            onClick={handleSubMenuOpen}
            onMouseEnter={handleSubMenuOpen}
            onMouseLeave={handleSubMenuClose}
        >
            <MuiMenuStyled
                id={props.menuId}
                anchorEl={anchorElement}
                open={isSubMenuOpen}
                aria-label={props.menuAriaLabel}
                className={A11yClassNames.POPUP}
                asSubMenu={true}
                sx={{pointerEvents: 'none'}} // disables the menu background wrapper for accessing submenu
                {...getOriginOfAnchorAndTransform(props.openAt)}
            >
                {props.children}
            </MuiMenuStyled>
        </MenuItem>
    );
}

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
