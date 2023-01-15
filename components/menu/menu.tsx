// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, useState, MouseEvent, useEffect, KeyboardEvent, SyntheticEvent} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import MuiMenuList from '@mui/material/MenuList';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {getIsMobileView} from 'selectors/views/browser';

import {openModal, closeModal} from 'actions/views/modals';

import {A11yClassNames} from 'utils/constants';

import CompassDesignProvider from 'components/compass_design_provider';
import Tooltip from 'components/tooltip';
import OverlayTrigger from 'components/overlay_trigger';
import GenericModal from 'components/generic_modal';

import {MuiMenuStyled} from './menu_styled';

const OVERLAY_TIME_DELAY = 500;
const MENU_OPEN_ANIMATION_DURATION = 150;
const MENU_CLOSE_ANIMATION_DURATION = 100;

interface Props {
    menuButtonId?: string;
    menuButtonAriaLabel?: string;
    menuButtonClassName?: string;
    menuButtonChildren: ReactNode;
    menuButtonTooltipId?: string;
    menuButtonTooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
    menuButtonTooltipText?: string;
    menuButtonTooltipClassName?: string;
    menuId: string;
    menuAriaLabel?: string;
    onMenuToggle?: (isOpen: boolean) => void; // Probably dont use this, but its there if you have to
    freezeCloseOnClick?: boolean;
    children: ReactNode[];
}

/**
 * @example
 * import * as Menu from 'components/menu';
 *
 * <Menu.Container>
 *  <Menu.Item>
 *  <Menu.Item>
 *  <Menu.Separator/>
 * </Menu.Item>
 */
export function Menu(props: Props) {
    const theme = useSelector(getTheme);

    const isMobileView = useSelector(getIsMobileView);

    const dispatch = useDispatch();

    const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
    const [disableAutoFocusItem, setDisableAutoFocusItem] = useState(false);
    const isMenuOpen = Boolean(anchorElement);

    function handleMenuClose(event: MouseEvent<HTMLDivElement>) {
        event.preventDefault();
        setAnchorElement(null);
        setDisableAutoFocusItem(false);
    }

    function handleMenuClick() {
        if (!props.freezeCloseOnClick) {
            setAnchorElement(null);
        }
    }

    function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === 'Enter') {
            const target = event.target as HTMLElement;
            const ariaHasPopup = target?.getAttribute('aria-haspopup') === 'true' ?? false;

            // Avoid closing the sub menu item on enter
            if (!ariaHasPopup) {
                setAnchorElement(null);
            }
        }
    }

    function handleMenuButtonClick(event: SyntheticEvent<HTMLButtonElement>) {
        event.preventDefault();

        if (isMobileView) {
            dispatch(
                openModal<MenuModalProps>({
                    modalId: props.menuId,
                    dialogType: MenuModal,
                    dialogProps: {
                        menuButtonId: props.menuButtonId,
                        menuId: props.menuId,
                        menuAriaLabel: props.menuAriaLabel,
                        children: props.children,
                    },
                }),
            );
        } else {
            setAnchorElement(event.currentTarget);
        }
    }

    function handleMenuButtonMouseDown() {
        // This is needed to prevent focus-visible being set on clicking menubutton with mouse
        setDisableAutoFocusItem(true);
    }

    function renderMenuButton() {
        // We construct the menu button here so we can set onClick correctly here to support both web and mobile view
        const triggerElement = (
            <button
                id={props.menuButtonId}
                aria-controls={props.menuId}
                aria-haspopup={true}
                aria-expanded={isMenuOpen}
                aria-label={props.menuButtonAriaLabel}
                className={props.menuButtonClassName}
                onClick={handleMenuButtonClick}
                onMouseDown={handleMenuButtonMouseDown}
            >
                {props.menuButtonChildren}
            </button>
        );

        if (props.menuButtonTooltipText && !isMobileView) {
            return (
                <OverlayTrigger
                    delayShow={OVERLAY_TIME_DELAY}
                    placement={props?.menuButtonTooltipPlacement ?? 'top'}
                    overlay={
                        <Tooltip
                            id={props.menuButtonTooltipId}
                            className={props.menuButtonTooltipClassName}
                        >
                            {props.menuButtonTooltipText}
                        </Tooltip>
                    }
                    disabled={isMenuOpen}
                >
                    {triggerElement}
                </OverlayTrigger>
            );
        }

        return triggerElement;
    }

    useEffect(() => {
        if (props.onMenuToggle) {
            props.onMenuToggle(isMenuOpen);
        }
    }, [isMenuOpen]);

    if (isMobileView) {
        // In mobile view, the menu is rendered as a modal
        return renderMenuButton();
    }

    return (
        <CompassDesignProvider theme={theme}>
            {renderMenuButton()}
            <MuiMenuStyled
                anchorEl={anchorElement}
                open={isMenuOpen}
                onClose={handleMenuClose}
                onClick={handleMenuClick}
                onKeyDown={handleMenuKeyDown}
                className={A11yClassNames.POPUP}
                disableAutoFocusItem={disableAutoFocusItem}
                MenuListProps={{
                    id: props.menuId,
                    'aria-label': props.menuAriaLabel,
                }}
                TransitionProps={{
                    mountOnEnter: true,
                    unmountOnExit: true,
                    timeout: {
                        enter: MENU_OPEN_ANIMATION_DURATION,
                        exit: MENU_CLOSE_ANIMATION_DURATION,
                    },
                }}
            >
                {props.children}
            </MuiMenuStyled>
        </CompassDesignProvider>
    );
}

interface MenuModalProps {
    menuButtonId: Props['menuButtonId'];
    menuId: Props['menuId'];
    menuAriaLabel: Props['menuAriaLabel'];
    children: Props['children'];
}

function MenuModal(props: MenuModalProps) {
    const dispatch = useDispatch();

    const theme = useSelector(getTheme);

    function handleModalExited() {
        dispatch(closeModal(props.menuId));
    }

    function handleModalClickCapture(event: MouseEvent<HTMLDivElement>) {
        if (event && event.currentTarget.contains(event.target as Node)) {
            for (const currentElement of event.currentTarget.children) {
                if (
                    currentElement.contains(event.target as Node) &&
                    !currentElement.ariaHasPopup
                ) {
                    // We check for property ariaHasPopup because we don't want to close the menu
                    // if the user clicks on a submenu item. And let submenu component handle the click.
                    handleModalExited();
                    break;
                }
            }
        }
    }

    return (
        <CompassDesignProvider theme={theme}>
            <GenericModal
                id={props.menuId}
                className='menuModal'
                backdrop={true}
                ariaLabel={props.menuAriaLabel}
                onExited={handleModalExited}
            >
                <MuiMenuList // serves as backdrop for modals
                    component='div'
                    aria-labelledby={props.menuButtonId}
                    onClick={handleModalClickCapture}
                >
                    {props.children}
                </MuiMenuList>
            </GenericModal>
        </CompassDesignProvider>
    );
}
