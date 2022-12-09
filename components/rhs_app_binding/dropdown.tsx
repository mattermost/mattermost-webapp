// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import Constants from 'utils/constants';

import {AppBinding} from '@mattermost/types/apps';

import {CommonProps} from './common_props';

export type DropdownProps = {
    Button: React.ElementType<CommonProps & {isMenuOpen: boolean}>;
    onSelect: (binding: AppBinding) => void;
    hint: React.ReactNode;
} & CommonProps;

export default function Dropdown(props: DropdownProps) {
    const [isMenuOpen, setMenuIsOpen] = useState(false);
    const [openUp, setOpenUp] = useState(false);
    const buttonRef = useRef<HTMLAnchorElement | null>(null);

    const handleDropdownOpened = (open: boolean) => {
        setMenuIsOpen(open);

        if (!open) {
            return;
        }

        const buttonRect = buttonRef.current?.getBoundingClientRect();
        let y;
        if (typeof buttonRect?.y === 'undefined') {
            y = typeof buttonRect?.top == 'undefined' ? 0 : buttonRect?.top;
        } else {
            y = buttonRect?.y;
        }
        const windowHeight = window.innerHeight;

        const totalSpace = windowHeight - 80; //MENU_BOTTOM_MARGIN;
        const spaceOnTop = y - Constants.CHANNEL_HEADER_HEIGHT;
        const spaceOnBottom = (totalSpace - (spaceOnTop + Constants.POST_AREA_HEIGHT));

        setOpenUp(spaceOnTop > spaceOnBottom);
    };

    const handleMenuClick = React.useCallback((e) => {
        e.stopPropagation();
        setMenuIsOpen(!isMenuOpen);
    }, [isMenuOpen]);

    const onSelectedItem = async (e: React.MouseEvent, binding: AppBinding) => {
        e.stopPropagation();
        setMenuIsOpen(false);
        props.onSelect(binding);
    };

    const menuItems = props.binding.bindings?.map((binding) => {
        let icon: JSX.Element | undefined;
        if (binding.icon) {
            icon = (
                <img
                    key={binding.app_id + 'app_icon'}
                    src={binding.icon}
                />
            );
        }

        return (
            <Menu.ItemAction
                text={binding.label}
                key={binding.location}
                onClick={(e: React.MouseEvent) => onSelectedItem(e, binding)}
                icon={icon}
            />
        );
    });

    const tooltip = (
        <Tooltip>
            {props.hint}
        </Tooltip>
    );

    return (
        <MenuWrapper
            open={isMenuOpen}
            onToggle={handleDropdownOpened}
        >
            <OverlayTrigger
                className='hidden-xs'
                delayShow={500}
                placement='top'
                overlay={tooltip}
                rootClose={true}
            >
                <span
                    ref={buttonRef}
                    onClick={handleMenuClick}
                >
                    <props.Button
                        {...props}
                        isMenuOpen={isMenuOpen}
                    />
                </span>
            </OverlayTrigger>
            <Menu
                openLeft={true}
                openUp={openUp}
                ariaLabel={props.binding.hint || ''}
            >
                {menuItems}
            </Menu>
        </MenuWrapper>
    );
}
