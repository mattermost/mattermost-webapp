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
}

export type MenuGroup = {
    menuItems: MenuItemProps[] | JSX.Element[];
    title?: string;
};

export interface MenuPopoverProps {
    triggerRef: React.RefObject<HTMLElement>;
    isVisible: boolean;
    isMobile?: boolean;
    placement?: Placement;
    offset?: [number | null | undefined, number | null | undefined];
    children?: React.ReactNode;
}

export interface MenuDataProps {
    open: boolean;
    groups: MenuGroup[];
    trigger: React.RefObject<HTMLElement>;
    placement: Placement;
    active?: boolean;
    isMobile?: boolean;
    title?: string;
    isSubmenu?: boolean;
    closeSubmenuDown?: boolean;
    closeSubmenu?: () => void;
}

export interface MenuProps {
    title?: string;
    submenuTitle?: string;
    trigger: {
        element: JSX.Element;
        ref: React.RefObject<HTMLButtonElement>;
    };
    submenuTrigger?: {
        element: JSX.Element;
        ref: React.RefObject<HTMLButtonElement>;
    };
    groups: MenuGroup[];
    submenuGroups?: MenuGroup[];
    placement?: Placement;
    open: boolean;
    submenuOpen?: boolean;
    overlayCloseHandler?: () => void;
    closeSubmenu?: () => void;
}
