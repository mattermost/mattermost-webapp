// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';

import {FormattedMessage} from 'react-intl';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import Constants from 'utils/constants';
import {DotsVerticalIcon} from '@mattermost/compass-icons/components';

import classNames from 'classnames';

import {AppBinding} from '@mattermost/types/apps';

import {CommonProps} from './common_props';

export default function ActionsMenu(props: CommonProps) {
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
    }, [openUp]);

    const onSelectedItem = async (e: React.MouseEvent, binding: AppBinding) => {
        e.stopPropagation();
        setMenuIsOpen(false);
        props.handleBindingClick(binding);
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
        <Tooltip id='copyButton'>
            {props.binding.hint || (
                <FormattedMessage
                    id={'the.id'}
                    defaultMessage={'Actions'}
                />
            )}
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
                <button
                    className={classNames('mm-app-bar-rhs-binding-list-item__more-btn',
                        {'more-btn-menu-active': isMenuOpen})}
                    onClick={handleMenuClick}
                    ref={buttonRef}
                >
                    <DotsVerticalIcon
                        size={18}
                        color={'currentColor'}
                    />
                </button>
            </OverlayTrigger>
            <Menu

                // id={`${this.props.location}_actions_dropdown_${this.props.post.id}`}
                openLeft={true}
                openUp={openUp}
                ariaLabel={props.binding.hint || ''}

                // ariaLabel={Utils.localizeMessage('post_info.menuAriaLabel', 'Post extra options')}
                // key={`${this.props.location}_actions_dropdown_${this.props.post.id}`}
            >
                {menuItems}
            </Menu>
        </MenuWrapper>
    );
}
