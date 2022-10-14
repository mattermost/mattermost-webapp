// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';

import {FormattedMessage} from 'react-intl';

import {AppBinding} from '@mattermost/types/apps';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import Constants from 'utils/constants';

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

    const handleMenuClick = () => {
        setMenuIsOpen(true);
    };

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
                onClick={(e) => onSelectedItem(e, binding)}
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
        <div
            onClick={(e) => e.stopPropagation()}
            className='actions-container'
        >
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
                    {/* <button
                        key='more-actions-button'
                        // ref={this.buttonRef}
                        // id={`${this.props.location}_actions_button_${this.props.post.id}`}
                        // aria-label={Utils.localizeMessage('post_info.actions.tooltip.actions', 'Actions').toLowerCase()}
                        // className={classNames('post-menu__item', {
                        //     'post-menu__item--active': isMenuOpen,
                        // })}
                        type='button'
                        aria-expanded='false'
                        onClick={handleMenuClick}
                    >
                        <i className={'icon icon-apps'} />
                    </button> */}
                    <i
                        className='icon icon-dots-vertical'
                        style={{cursor: 'pointer'}}
                        onClick={handleMenuClick}
                        ref={buttonRef}

                    />

                    {/* <button
                        className='icon action-wrapper'
                        onClick={handleMenuClick}
                        ref={buttonRef}
                    >
                        <i className='icon icon-dots-vertical' />
                    </button> */}
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
        </div>
    );
}
