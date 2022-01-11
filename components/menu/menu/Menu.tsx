import React, { useRef, useState, useEffect, forwardRef } from "react";
import styled, { css } from "styled-components";
import classNames from "classnames";
import { Placement } from "popper.js";

import MenuItem from "../menu-item/MenuItem";
import MenuPopover from "./MenuPopover";
import { useClickOutsideRef } from "components/global_header/hooks";

const Divider = () => (
    <div style={{ height: "1px", width: "auto", backgroundColor: "#e0e0e0" }} />
);

const useIsMobile = (): boolean => {
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const mobileMediaQuery = window.matchMedia("(max-width: 699px)");

    const handleChange = (event: MediaQueryListEvent) => {
        setIsMobile(event.matches);
    };

    useEffect(() => {
        mobileMediaQuery.addEventListener("change", handleChange);
        return () => {
            mobileMediaQuery.removeEventListener("change", handleChange);
        };
    }, [handleChange]);

    useEffect(() => {
        setIsMobile(mobileMediaQuery.matches);
    }, []);

    return isMobile;
};

const MenuItems = styled.div<{ isMobile: boolean; isSubmenu: boolean }>(
    ({ isMobile, isSubmenu }) => {
        return isMobile
            ? css`
                  background-color: rgba(var(--sidebar-text-rgb));
                  min-height: 340px;
                  height: auto;
                  border-radius: 5%;

                  transform: ${isSubmenu
                      ? "translateX(100%)"
                      : "translateY(100%)"};
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
    }
);

const MenuHeader = styled.div`
    @media screen and min-width(400px) {
        display: none;
    }

    text-align: center;
    color: var(--center-channel-color);
    padding: 1rem;
`;

interface MenuDataProps {
    open: boolean;
    groups: MenuGroup;
    trigger: React.RefObject<HTMLElement>;
    placement: Placement;
    active: boolean;
    isMobile: boolean;
    title?: string;
    isSubmenu?: boolean;
    closeSubmenuDown?: boolean;
    closeSubmenu?: () => void;
}

const MenuData = forwardRef<HTMLDivElement, MenuDataProps>((props, ref) => {
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
        isMobile,
    } = props;

    return (
        <>
            {/* {trigger.current} */}
            <MenuPopover
                isVisible={open}
                triggerRef={trigger}
                placement={placement}
                isMobile={isMobile}
            >
                <MenuItems
                    ref={ref}
                    isMobile={isMobile}
                    isSubmenu={Boolean(isSubmenu)}
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
});

function usePrevious<T extends unknown>(value: T): T | undefined {
    // The ref object is a generic container whose current property is mutable ...
    // ... and can hold any value, similar to an instance property on a class
    const ref = useRef<T>();
    // Store current value in ref
    useEffect(() => {
        ref.current = value;
    }, [value]); // Only re-run if value changes
    // Return previous value (happens before update in useEffect above)

    return ref.current;
}

interface MenuProps {}

type MenuGroup = { menuItems: React.ReactNode[]; title?: string }[];

const Menu: React.ComponentType<MenuProps> = (props) => {
    const [open, setOpen] = useState(false);
    const [submenuOpen, setSubmenuOpen] = useState(false);
    const buttonReference = useRef<HTMLButtonElement>(null);
    const menuRef = useRef(null);
    const submenuRef = useRef(null);
    const menuItemReference = useRef(null);
    const prevOpen = usePrevious(open);
    const prevSubmenuOpen = usePrevious(submenuOpen);
    const isMobile = useIsMobile();

    useClickOutsideRef([buttonReference, menuRef, submenuRef], () => {
        if (!open || isMobile) {
            return;
        }
        setOpen(false);
        setSubmenuOpen(false);
    });

    const closeSubmenuDown = Boolean(
        prevOpen && prevSubmenuOpen && !submenuOpen && !open
    );

    const menuGroup: MenuGroup = [
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

    const submenuGroup: MenuGroup = [
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
                ref={menuRef}
                groups={menuGroup}
                trigger={buttonReference}
                open={open}
                active={open && !submenuOpen}
                placement={"right-end"}
                isMobile={isMobile}
            />
            <MenuData
                ref={submenuRef}
                trigger={menuItemReference}
                open={submenuOpen}
                isSubmenu={true}
                closeSubmenu={() => setSubmenuOpen(false)}
                closeSubmenuDown={closeSubmenuDown}
                active={submenuOpen}
                groups={submenuGroup}
                placement={"right-end"}
                isMobile={isMobile}
            />
        </>
    );
};

export default Menu;
