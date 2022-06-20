// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState, useEffect} from 'react';

import {CSSTransition} from 'react-transition-group';

import classNames from 'classnames';

import {MenuProps, SubmenuProps} from './Menu.types';
import MenuItem from './MenuItem';
import MenuPopover from './MenuPopover';
import {Divider, MenuHeader, MenuItems, MenuTitle, Overlay} from './Menu.styles';

const useIsMobile = (): boolean => {
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const mobileMediaQuery = window.matchMedia('(max-width: 699px)');

    const handleChange = (event: MediaQueryListEvent) => {
        setIsMobile(event.matches);
    };

    useEffect(() => {
        mobileMediaQuery.addEventListener('change', handleChange);
        return () => {
            mobileMediaQuery.removeEventListener('change', handleChange);
        };
    }, [handleChange]);

    useEffect(() => {
        setIsMobile(mobileMediaQuery.matches);
    }, []);

    return isMobile;
};

const SubMenu = (props: SubmenuProps): JSX.Element => {
    const subMenuTrigger = useRef(null);
    const [open, setOpen] = useState<boolean>(false);

    const {data, isMobile, title} = props;

    const handleToggle = (): void => setOpen(!open);

    return (
        <>
            <MenuItem
                label={data.label}
                ref={subMenuTrigger}
                leadingElement={data.leadingElement}
                trailingElement={<i className={'chevron-right'}/>}
                onClick={isMobile ? () => handleToggle() : undefined}
                onMouseEnter={isMobile ? undefined : () => handleToggle()}
            />
            <MenuPopover
                isVisible={open}
                triggerRef={subMenuTrigger}
                placement={'right-start'}
                isMobile={isMobile}
                zIndex={22}
            >
                <MenuItems
                    isMobile={isMobile}
                    isSubmenu={true}
                    className={classNames({open}, 'isSubmenu')}
                >
                    <MenuHeader
                        className={classNames({
                            hasArrow: isMobile,
                            isMobile,
                        })}
                    >
                        {isMobile && (
                            <i
                                className='icon icon-arrow-back-ios'
                                style={{
                                    margin: '0 auto 0 23px',
                                    color: '#3D3C40',
                                }}
                                onClick={handleToggle}
                            />
                        )}
                        {title && <MenuTitle>{title}</MenuTitle>}
                    </MenuHeader>
                    {data.items?.map((item, index) => {
                        const key = `${item.label}_${index}`;

                        if (item.items && item.items.length > 0) {
                            return (
                                <SubMenu
                                    key={key}
                                    data={item}
                                    isMobile={isMobile}
                                />
                            );
                        }

                        return (
                            <MenuItem
                                key={key}
                                label={item.label}
                                leadingElement={item.leadingElement}
                                trailingElement={item.trailingElement}
                                onClick={item.onClick}
                            />
                        );
                    })}
                </MenuItems>
            </MenuPopover>
        </>
    );
};

const Menu = (props: MenuProps): JSX.Element => {
    const {title, trigger, open, data, placement, overlayCloseHandler} = props;
    const isMobile = useIsMobile();

    return (
        <>
            <CSSTransition
                timeout={300}
                classNames='fade'
                in={open}
                unmountOnExit={true}
            >
                <Overlay onClick={overlayCloseHandler}/>
            </CSSTransition>
            <MenuPopover
                triggerRef={trigger}
                isVisible={open}
                placement={placement}
                isMobile={isMobile}
                zIndex={20}
            >
                <MenuItems
                    isMobile={isMobile}
                    className={classNames({open}, 'isParent')}
                >
                    <MenuHeader
                        className={classNames({
                            isMobile,
                        })}
                    >
                        {title && <MenuTitle>{title}</MenuTitle>}
                    </MenuHeader>
                    {data.items?.map((item, index) => {
                        const key = `${item.label}_${index}`;
                        if (item.items && item.items.length > 0) {
                            return (
                                <SubMenu
                                    key={key}
                                    data={item}
                                    title={item.label}
                                    isMobile={isMobile}
                                />
                            );
                        }

                        return (
                            <>
                                <MenuItem
                                    key={key}
                                    label={item.label}
                                    leadingElement={item.leadingElement}
                                    trailingElement={item.trailingElement}
                                    onClick={item.onClick}
                                />
                                {item.divider && <Divider/>}
                            </>
                        );
                    })}
                </MenuItems>
            </MenuPopover>
        </>
    );
};

export default Menu;
