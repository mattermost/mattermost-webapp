// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Placement} from 'popper.js';

export interface MenuItemProps {
    id?: string;
    label: string;
    description?: string;
    destructive?: boolean;
    disabled?: boolean;
    leadingElement?: React.ReactNode;
    trailingElementLabel?: string;
    trailingElement?: React.ReactNode;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    divider?: boolean;
}

export type MenuDataProps = {
    items?: MenuDataProps[];
} & MenuItemProps;

export interface MenuPopoverProps {
    triggerRef: React.RefObject<HTMLElement>;
    isVisible?: boolean;
    isMobile?: boolean;
    placement?: Placement;
    offset?: [number | null | undefined, number | null | undefined];
    children?: React.ReactNode;
    zIndex: number;
    overlayCloseHandler?: () => void;
}

export interface MenuProps {
    title?: string;
    submenuTitle?: string;
    trigger: React.RefObject<HTMLButtonElement>;
    data: MenuDataProps;
    placement?: Placement;
    open: boolean;
    overlayCloseHandler?: () => void;
}

export type SubmenuProps = Pick<MenuProps, 'data' | 'title' | 'placement'> & {
    isMobile: boolean;
};
