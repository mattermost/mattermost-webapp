// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, useState, MouseEvent} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Menu as MuiMenu, MenuList as MuiMenuList} from '@mui/material';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {getIsMobileView} from 'selectors/views/browser';

import {openModal, closeModal} from 'actions/views/modals';

import CompassDesignProvider from 'components/compass_design_provider';
import Tooltip from 'components/tooltip';
import OverlayTrigger from 'components/overlay_trigger';
import GenericModal from 'components/generic_modal';

const OVERLAY_TIME_DELAY = 500;

interface Props {

    // Anchor button props
    anchorId?: string;
    anchorNode?: ReactNode;
    anchorClassName?: string;
    anchorAriaLabel?: string;

    // Menu props
    menuId: string;
    menuAriaLabel?: string;

    // Tooltip props
    tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
    tooltipId?: string;
    tooltipText?: string;
    tooltipClassName?: string;

    children: ReactNode[];
}

export function Menu(props: Props) {
    const theme = useSelector(getTheme);

    const isMobileView = useSelector(getIsMobileView);

    const dispatch = useDispatch();

    const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorElement);

    if (isMobileView) {
        function MenuModalComponent() {
            function handleModalExited() {
                dispatch(closeModal(props.menuId));
            }

            function handleModalClickCapture(event: MouseEvent<HTMLUListElement>) {
                if (event && event.currentTarget.contains(event.target as Node)) {
                    for (const currentElement of event.currentTarget.children) {
                        if (currentElement.contains(event.target as Node) && !currentElement.ariaHasPopup) {
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
                        ariaLabel={props.menuAriaLabel}
                        onExited={handleModalExited}
                        backdrop={true}
                        className='menuModal'
                    >
                        <MuiMenuList
                            aria-labelledby={props.anchorId}
                            onClick={handleModalClickCapture}
                        >
                            {props.children}
                        </MuiMenuList>
                    </GenericModal>

                </CompassDesignProvider>
            );
        }

        function handleAnchorButtonClickOnMobile(event: MouseEvent<HTMLButtonElement>) {
            event.preventDefault();

            dispatch(openModal({
                modalId: props.menuId,
                dialogType: MenuModalComponent,
            }));
        }

        return (
            <button
                id={props.anchorId}
                aria-controls={props.menuId}
                aria-haspopup='true'
                aria-label={props.anchorAriaLabel}
                className={props.anchorClassName}
                onClick={handleAnchorButtonClickOnMobile}
            >
                {props.anchorNode}
            </button>
        );
    }

    function handleAnchorButtonClick(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault();

        setAnchorElement(event.currentTarget);
    }

    function renderAnchorNode() {
        const anchorNode = (
            <button
                id={props.anchorId}
                aria-controls={isMenuOpen ? props.menuId : undefined}
                aria-haspopup='true'
                aria-expanded={isMenuOpen ? 'true' : undefined}
                aria-label={props.anchorAriaLabel}
                className={props.anchorClassName}
                onClick={handleAnchorButtonClick}
                tabIndex={isMenuOpen ? 0 : -1}
            >
                {props.anchorNode}
            </button>
        );

        if (props.tooltipText) {
            return (
                <OverlayTrigger
                    delayShow={OVERLAY_TIME_DELAY}
                    placement={props?.tooltipPlacement ?? 'top'}
                    overlay={
                        <Tooltip
                            id={props.tooltipId}
                            className={props.tooltipClassName}
                        >
                            {props.tooltipText}
                        </Tooltip>
                    }
                    disabled={!props.tooltipText || isMenuOpen}
                >
                    {anchorNode}
                </OverlayTrigger>
            );
        }

        return anchorNode;
    }

    function handleMenuClose(event: MouseEvent<HTMLDivElement | HTMLUListElement>) {
        event.preventDefault();
        setAnchorElement(null);
    }

    return (
        <CompassDesignProvider theme={theme}>
            {renderAnchorNode()}
            <MuiMenu
                id={props.menuId}
                anchorEl={anchorElement}
                open={isMenuOpen}
                onClose={handleMenuClose}
                aria-label={props.menuAriaLabel}
            >
                <MuiMenuList
                    aria-labelledby={props.anchorId}
                    onClick={handleMenuClose}
                >
                    {props.children}
                </MuiMenuList>
            </MuiMenu>
        </CompassDesignProvider>
    );
}
