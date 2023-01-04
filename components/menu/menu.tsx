// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, useState, MouseEvent, useEffect, KeyboardEvent} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import MuiMenuList from '@mui/material/MenuList';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {getIsMobileView} from 'selectors/views/browser';
import {isAnyModalOpen} from 'selectors/views/modals';

import {openModal, closeModal} from 'actions/views/modals';

import {A11yClassNames} from 'utils/constants';

import CompassDesignProvider from 'components/compass_design_provider';
import Tooltip from 'components/tooltip';
import OverlayTrigger from 'components/overlay_trigger';
import GenericModal from 'components/generic_modal';

import {MuiMenuStyled} from './menu_styled';

const OVERLAY_TIME_DELAY = 500;

interface Props {

    // Trigger button props
    triggerId?: string;
    triggerElement: ReactNode;
    triggerClassName?: string;
    triggerAriaLabel?: string;

    // Tooltip of Trigger button props
    triggerTooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
    triggerTooltipId?: string;
    triggerTooltipText?: string;
    triggerTooltipClassName?: string;

    // Menu props
    menuId: string;
    menuAriaLabel?: string;

    children: ReactNode[];
}

/**
 * @example
 * import * as Menu from 'components/menu';
 *
 * <Menu.Container>
 *  <Menu.Item>
 *  <Menu.Item>
 *  <Menu.Divider/>
 * </Menu.Item>
 */
export function Menu(props: Props) {
    const theme = useSelector(getTheme);

    const isMobileView = useSelector(getIsMobileView);

    const anyModalOpen = useSelector(isAnyModalOpen);

    const dispatch = useDispatch();

    const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorElement);

    function handleAnchorButtonClick(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault();

        if (isMobileView) {
            dispatch(
                openModal<MenuModalProps>({
                    modalId: props.menuId,
                    dialogType: MenuModal,
                    dialogProps: {
                        triggerId: props.triggerId,
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

    function close() {
        setAnchorElement(null);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === 'Enter') {
            const target = event.target as HTMLElement;
            const ariaHasPopup = target.getAttribute('aria-haspopup');

            // Avoid closing the sub menu item on enter
            if (!ariaHasPopup) {
                close();
            }
        }
    }

    function renderTriggerButton() {
        // Since the open and close state lies in this component, we need to force the visibility of the trigger element
        const forceVisibleOnOpen = isMenuOpen ? {display: 'block'} : undefined;

        const triggerElement = (
            <button
                id={props.triggerId}
                aria-controls={props.menuId}
                aria-haspopup={true}
                aria-expanded={isMenuOpen}
                aria-label={props.triggerAriaLabel}
                tabIndex={0}
                className={props.triggerClassName}
                onClick={handleAnchorButtonClick}
                style={forceVisibleOnOpen}
            >
                {props.triggerElement}
            </button>
        );

        if (props.triggerTooltipText && !isMobileView) {
            return (
                <OverlayTrigger
                    delayShow={OVERLAY_TIME_DELAY}
                    placement={props?.triggerTooltipPlacement ?? 'top'}
                    overlay={
                        <Tooltip
                            id={props.triggerTooltipId}
                            className={props.triggerTooltipClassName}
                        >
                            {props.triggerTooltipText}
                        </Tooltip>
                    }
                    disabled={!props.triggerTooltipText || isMenuOpen}
                >
                    {triggerElement}
                </OverlayTrigger>
            );
        }

        return triggerElement;
    }

    useEffect(() => {
        if (anyModalOpen && !isMobileView) {
            setAnchorElement(null);
        }
    }, [anyModalOpen, isMobileView]);

    if (isMobileView) {
        // In mobile view, the menu is rendered as a modal
        return renderTriggerButton();
    }

    return (
        <CompassDesignProvider theme={theme}>
            {renderTriggerButton()}
            <MuiMenuStyled
                id={props.menuId}
                anchorEl={anchorElement}
                open={isMenuOpen}
                onClose={close}
                onClick={close}
                onKeyDown={handleKeyDown}
                aria-label={props.menuAriaLabel}
                className={A11yClassNames.POPUP}
            >
                {isMenuOpen && props.children}
            </MuiMenuStyled>
        </CompassDesignProvider>
    );
}

interface MenuModalProps {
    triggerId: Props['triggerId'];
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
                    aria-labelledby={props.triggerId}
                    onClick={handleModalClickCapture}
                >
                    {props.children}
                </MuiMenuList>
            </GenericModal>
        </CompassDesignProvider>
    );
}
