// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, useState, MouseEvent, FocusEvent} from 'react';
import {Menu} from '@mui/material';

import Tooltip from 'components/tooltip';
import CompassDesignProvider from 'components/compass_design_provider';
import OverlayTrigger from 'components/overlay_trigger';

import type {PropsFromRedux} from './index';

const OVERLAY_TIME_DELAY = 500;

interface Props extends PropsFromRedux {

    // Anchor button props
    anchorId?: string;
    anchorNode?: ReactNode;
    anchorClassName?: string;
    anchorAriaLabel?: string;

    // Menu props
    menuId?: string;
    menuAriaLabel?: string;

    // Tooltip props
    tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
    tooltipId?: string;
    tooltipText?: string;
    tooltipClassName?: string;

    children: ReactNode;
}

export function MenuComponent(props: Props) {
    const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorElement);

    const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setAnchorElement(event.currentTarget);
    };

    const handleMenuClose = (event: MouseEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>) => {
        event.preventDefault();
        setAnchorElement(null);
    };

    return (
        <CompassDesignProvider theme={props.theme}>
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
                <button
                    id={props.anchorId}
                    aria-controls={isMenuOpen ? props.menuId : undefined}
                    aria-haspopup='true'
                    aria-expanded={isMenuOpen ? 'true' : undefined}
                    aria-label={props.anchorAriaLabel}
                    className={props.anchorClassName}
                    onClick={handleMenuOpen}
                    tabIndex={isMenuOpen ? 0 : -1}
                >
                    {props.anchorNode}
                </button>
            </OverlayTrigger>
            <Menu
                id={props.menuId}
                anchorEl={anchorElement}
                open={isMenuOpen}
                onClose={handleMenuClose}
                onBlur={handleMenuClose}
                aria-label={props.menuAriaLabel}
                MenuListProps={{
                    'aria-labelledby': props.anchorId,
                }}
                PaperProps={{
                    style: {
                        maxHeight: '50vh',
                    },
                }}
            >
                {props.children}
            </Menu>
        </CompassDesignProvider>
    );
}
