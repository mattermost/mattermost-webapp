import React, { useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import classNames from 'classnames';

import MenuItem from '../menu-item/MenuItem';
import MenuPopover from './MenuPopover';

const Divider = () => (
    <div style={{height: "1px", width: 'auto', backgroundColor: '#e0e0e0'}} />
);
const mobileMediaQuery = window.matchMedia('(max-width: 399px)');
mobileMediaQuery?.addEventListener('change', processViewSizeChange);

let viewIsMobile = mobileMediaQuery.matches;
const setViewIsMobile = (value) => {
    viewIsMobile = value;
};
setViewIsMobile(mobileMediaQuery.matches);

function processViewSizeChange(event) {
    setViewIsMobile(event.matches);
}

const MenuItems = styled.div(({ isMobile }) => {
    return isMobile ? css`
        background-color: rgba(var(--sidebar-text-rgb));
        min-height: 340px;
        height: auto;
        border-radius: 5%;
        transform: translateY(100%);
        transition: transform 500ms ease-in-out 0ms,
        
        &.open {
            transform: translateY(0);
        }
        &:not(:first-child) {
            transform: translateX(100%);
        }

        &.open.active {
            position: relative;
            transform: translateX(0%);
            visibility: visible;
            z-index: 2;
        }

        &.open:not(.active) {
            transform: translateX(-100%);
            visibility: hidden;
        }

        transition: transform 300ms 0ms ease-in-out,
            visibility 300ms 0ms step-end;

        &.open.active {
            transition: transform 300ms 0ms ease-in-out,
                visibility 300ms 0ms step-start;
        }

        &.open:not(.active) {
            transition: transform 300ms 0ms ease-in-out,
                visibility 300ms 0ms step-end;
        }
    ` :
    css`
        border-radius: 8px;
        background-color: rgba(var(--sidebar-text-rgb));
        padding: 1rem 0;
        transform: scale(0);
        opacity: 0;
        transition: opacity 300ms ease-in-out 0ms,transform 300ms ease-in-out 0ms;

        &.open {
            transform: scale(1);
            opacity: 1;
        }
    `
});

const MenuHeader = styled.div`
    @media screen and min-width(400px) {
        display: none;
    }

    text-align: center;
    color: var(--center-channel-color);
    padding: 1rem;
`;

const MenuData = (props) => {
    const {title, open, groups, trigger, placement, active} = props;

    return (
        <>
            {trigger.element}
            <MenuPopover
                isVisible={open}
                triggerRef={trigger}
                placement={placement}
                isMobile={viewIsMobile}
            >
                <MenuItems isMobile={viewIsMobile} active={active} className={classNames({open, active})}>
                    {title && (
                        <>
                            <label>{title}</label>
                            <Divider/>
                        </>
                    )}
                    {groups.map((group) => (
                            <div>
                                {group.title && <label>{group.title}</label>}
                                {group.menuItems}
                                {groups.length > 1 && <Divider/>}
                            </div>
                        )
                    )}
                </MenuItems>
            </MenuPopover>
        </>
    )
}

const Menu = (props) => {
    const [open, setOpen] = useState(false);
    const [submenuOpen, setSubmenuOpen] = useState(false);
    const buttonReference = useRef(null);
    const menuItemReference = useRef(null);

  
    const menuGroup = [
        {
            menuItems: [
                <MenuItem ref={menuItemReference} description={'Opens submenu'} onClick={() => setSubmenuOpen(!submenuOpen)} label='Open Submenu' leadingElement={<i className='icon-plus'/>} trailingElementLabel="selected" trailingElement={<i className='icon-chevron-right'/>}/>,
                <MenuItem destructive={true} label='Join Mattermost' leadingElement={<i className='icon-sort-alphabetical-ascending'/>}/>,
                <MenuItem disabled label='Category Mattermost' leadingElement={<i className='icon-account-multiple-outline'/>}/>,
            ]
        },
    ];
    
    const submenuGroup = [
        {
            menuItems: [
                <MenuItem label='Leave Mattermost' leadingElement={<i className='icon-sort-alphabetical-ascending'/>}/>,
                <MenuItem label='Open Mattermost' leadingElement={<i className='icon-account-multiple-outline'/>}/>,
            ]
        },
    ];
    
    return (
        <>
        <button
            onClick={() => setOpen(!open)}
            ref={buttonReference}
        />
        <MenuData groups={menuGroup} trigger={buttonReference} open={open} active={open && !submenuOpen} placement={'right-end'}/>
        <MenuData
                trigger={menuItemReference}
                open={submenuOpen}
                active={submenuOpen}
                groups={submenuGroup}
                placement={'right-end'}
            />
        </>
    )    
}

export default Menu;
