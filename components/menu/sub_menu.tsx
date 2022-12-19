// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {
    KeyboardEvent,
    MouseEvent,
    ReactNode,
    useCallback,
    useState,
} from 'react';
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

interface Props {
    id?: MenuItemProps['id'];
    leadingElement?: MenuItemProps['leadingElement'];
    labels: MenuItemProps['labels'];
    trailingElements?: MenuItemProps['trailingElements'];
    isDestructive?: MenuItemProps['isDestructive'];

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

    const dispatch = useDispatch();

    const handleSubMenuOpen = (event: MouseEvent<HTMLLIElement>) => {
        event.preventDefault();

        if (isMobileView) {
            dispatch(openModal<SubMenuModalProps>({
                modalId: props.menuId,
                dialogType: SubMenuModal,
                dialogProps: {
                    menuId: props.menuId,
                    menuAriaLabel: props.menuAriaLabel,
                    children: props.children,
                },
            }));
        } else {
            setAnchorElement(event.currentTarget);
        }
    };

    const handleSubMenuClose = (event: MouseEvent<HTMLLIElement>) => {
        event.preventDefault();
        setAnchorElement(null);
    };

    const handleItemKeyDown = useCallback((event: KeyboardEvent<HTMLLIElement>) => {
        if (event.key === 'ArrowRight' || event.key === 'Enter') {
            event.preventDefault();
            setAnchorElement(event.currentTarget);
        }
    }, []);

    const handleSubMenuKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            // Stop the event from propagating upwards since that causes navigation to move by 2 items at a time
            event.stopPropagation();
        } else if (event.key === 'ArrowLeft' || event.key === 'Escape') {
            event.preventDefault();
            setAnchorElement(null);
        }
    }, []);

    const hasSubmenuItems = Boolean(props.children);
    if (!hasSubmenuItems) {
        return null;
    }

    const triggerButtonProps = {
        'aria-controls': props.menuId,
        'aria-haspopup': true,
        'aria-expanded': isSubMenuOpen,
        disableRipple: true,
        leadingElement: props.leadingElement,
        labels: props.labels,
        trailingElements: props.trailingElements,
        onClick: handleSubMenuOpen,
    };

    if (isMobileView) {
        return (<MenuItem {...triggerButtonProps}/>);
    }

    return (
        <MenuItem
            {...triggerButtonProps}
            onMouseEnter={handleSubMenuOpen}
            onMouseLeave={handleSubMenuClose}
            onKeyDown={handleItemKeyDown}
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
                onKeyDown={handleSubMenuKeyDown}
            >
                {props.children}
            </MuiMenuStyled>
        </MenuItem>
    );
}

interface SubMenuModalProps {
    menuId: Props['menuId'];
    menuAriaLabel?: Props['menuAriaLabel'];
    children: Props['children'];
}

function SubMenuModal(props: SubMenuModalProps) {
    const dispatch = useDispatch();

    const theme = useSelector(getTheme);

    function handleModalClose() {
        dispatch(closeModal(props.menuId));
    }

    return (
        <CompassDesignProvider theme={theme}>
            <GenericModal
                id={props.menuId}
                ariaLabel={props.menuAriaLabel}
                onExited={handleModalClose}
                backdrop={true}
                className='menuModal'
            >
                <MuiMenuList
                    aria-hidden={true}
                    onClick={handleModalClose}
                >
                    {props.children}
                </MuiMenuList>
            </GenericModal>
        </CompassDesignProvider>
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
