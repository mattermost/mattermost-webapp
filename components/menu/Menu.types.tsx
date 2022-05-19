// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Placement} from 'popper.js';

export interface MenuItemProps {
    label: string;
    description?: string;
    destructive?: boolean;
    disabled?: boolean;
    leadingElement?: React.ReactNode;
    trailingElementLabel?: string;
    trailingElement?: React.ReactNode;
    onClick?: () => void;
    onHover?: () => void;
}

export type MenuGroup = {
    menuItems: MenuItemProps[];
    title?: string;
};

export interface MenuPopoverProps {
    triggerRef: React.RefObject<HTMLElement>;
    isVisible: boolean;
    isMobile: boolean;
    placement?: Placement;
    offset?: [number | null | undefined, number | null | undefined];
    children?: React.ReactNode;
}

export interface MenuDataProps {
    open: boolean;
    groups: MenuGroup[];
    trigger: React.RefObject<HTMLElement>;
    placement: Placement;
    active: boolean;
    isMobile: boolean;
    menuTitle?: string;
    title?: string;
    isSubmenu?: boolean;
    closeSubmenuDown?: boolean;
    closeSubmenu?: () => void;
}

export interface MenuProps {
    title?: string;
    submenuTitle?: string;
    trigger: React.RefObject<HTMLElement>;
    submenuTrigger?: React.RefObject<HTMLElement>;
    groups: MenuGroup[];
    submenuGroups?: MenuGroup[];
    placement?: Placement;
}
