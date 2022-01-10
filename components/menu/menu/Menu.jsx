import React, { useRef, useState, useEffect } from "react";
import styled, { css } from "styled-components";
import classNames from "classnames";

import MenuItem from "../menu-item/MenuItem";
import MenuPopover from "./MenuPopover";
import views from "reducers/views";

const Divider = () => (
    <div style={{ height: "1px", width: "auto", backgroundColor: "#e0e0e0" }} />
);
const mobileMediaQuery = window.matchMedia("(max-width: 699px)");
mobileMediaQuery?.addEventListener("change", processViewSizeChange);

let viewIsMobile = mobileMediaQuery.matches;
const setViewIsMobile = (value) => {
    viewIsMobile = value;
};
setViewIsMobile(mobileMediaQuery.matches);

function processViewSizeChange(event) {
    setViewIsMobile(event.matches);
}

const MenuItems = styled.div(({ isMobile, isSubmenu }) => {
    return isMobile
        ? css`
              background-color: rgba(var(--sidebar-text-rgb));
              min-height: 340px;
              height: auto;
              border-radius: 5%;

              transform: ${isSubmenu ? "translateX(100%)" : "translateY(100%)"};
              transition: transform 500ms ease-in-out 0ms, &.open {
                  transform: translateY(0);
              }

              &.closeSubmenuDown {
                  transform: translateY(100%);
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
          `
        : css`
              border-radius: 8px;
              background-color: rgba(var(--sidebar-text-rgb));
              padding: 1rem 0;
              transform: scale(0);
              opacity: 0;
              transition: opacity 300ms ease-in-out 0ms,
                  transform 300ms ease-in-out 0ms;

              &.open {
                  transform: scale(1);
                  opacity: 1;
              }
          `;
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
    const {
        title,
        open,
        groups,
        trigger,
        placement,
        active,
        isSubmenu,
        closeSubmenu,
        closeSubmenuDown,
    } = props;
    console.log(viewIsMobile);
    return (
        <>
            {trigger.element}
            <MenuPopover
                isVisible={open}
                triggerRef={trigger}
                placement={placement}
                isMobile={viewIsMobile}
            >
                <MenuItems
                    isMobile={viewIsMobile}
                    active={active}
                    isSubmenu={isSubmenu}
                    className={classNames({ open, active, closeSubmenuDown })}
                >
                    {title && (
                        <>
                            <label>{title}</label>
                            <Divider />
                        </>
                    )}
                    {groups.map((group) => (
                        <div>
                            {isSubmenu && (
                                <button
                                    style={{
                                        fontSize: "20px",
                                        color: "rebeccapurple",
                                    }}
                                    onClick={closeSubmenu}
                                >
                                    go back
                                </button>
                            )}
                            {group.title && <label>{group.title}</label>}
                            {group.menuItems}
                            {groups.length > 1 && <Divider />}
                        </div>
                    ))}
                </MenuItems>
            </MenuPopover>
        </>
    );
};
function usePrevious(value) {
    // The ref object is a generic container whose current property is mutable ...
    // ... and can hold any value, similar to an instance property on a class
    const ref = useRef();
    // Store current value in ref
    useEffect(() => {
        ref.current = value;
    }, [value]); // Only re-run if value changes
    // Return previous value (happens before update in useEffect above)
    return ref.current;
}

const Overlay = styled.div(() => {
    return css`
        background-color: rgba(0, 0, 0, 0);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        height: 100%;
        min-height: 100%;
        left: 0;
        right: 0;
        top: 0;
        position: fixed;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        pointer-events: auto;
        -ms-scroll-chaining: none;
        transition: 1s;
        transition-property: background-color;
        visibility: hidden;
    `;
});
const Menu = (props) => {
    const [open, setOpen] = useState(false);
    const [submenuOpen, setSubmenuOpen] = useState(false);
    const buttonReference = useRef(null);
    const menuItemReference = useRef(null);
    const prevOpen = usePrevious(open);
    const prevSubmenuOpen = usePrevious(submenuOpen);

    const closeSubmenuDown =
        prevOpen && prevSubmenuOpen && !submenuOpen && !open;

    const menuGroup = [
        {
            menuItems: [
                <MenuItem
                    ref={menuItemReference}
                    description={"Opens submenu"}
                    onClick={() => setSubmenuOpen(!submenuOpen)}
                    label="Open Submenu"
                    leadingElement={<i className="icon-plus" />}
                    trailingElementLabel="selected"
                    trailingElement={<i className="icon-chevron-right" />}
                />,
                <MenuItem
                    destructive={true}
                    label="Join Mattermost"
                    leadingElement={
                        <i className="icon-sort-alphabetical-ascending" />
                    }
                />,
                <MenuItem
                    disabled
                    label="Category Mattermost"
                    leadingElement={
                        <i className="icon-account-multiple-outline" />
                    }
                />,
            ],
        },
    ];

    const submenuGroup = [
        {
            menuItems: [
                <MenuItem
                    label="Leave Mattermost"
                    leadingElement={
                        <i className="icon-sort-alphabetical-ascending" />
                    }
                />,
                <MenuItem
                    label="Open Mattermost"
                    leadingElement={
                        <i className="icon-account-multiple-outline" />
                    }
                />,
            ],
        },
    ];

    return (
        <>
            <button onClick={() => setOpen(!open)} ref={buttonReference}>
                trigger
            </button>
            <button
                onClick={() => {
                    setOpen(false);
                    setSubmenuOpen(false);
                }}
            >
                close all
            </button>

            <MenuData
                groups={menuGroup}
                trigger={buttonReference}
                open={open}
                active={open && !submenuOpen}
                placement={"right-end"}
            />
            <MenuData
                trigger={menuItemReference}
                open={submenuOpen}
                isSubmenu={true}
                closeSubmenu={() => setSubmenuOpen(false)}
                closeSubmenuDown={closeSubmenuDown}
                active={submenuOpen}
                groups={submenuGroup}
                placement={"right-end"}
            />
        </>
    );
};

export default Menu;
