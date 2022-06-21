// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import styled, {css} from 'styled-components';

const Overlay = styled.div<{isMobile?: boolean}>(
    ({isMobile}) => {
        return css`
        background-color: ${isMobile ? 'rgba(0, 0, 0, 0)' : 'transparent'};
        height: 100%;
        min-height: 100%;
        left: 0;
        right: 0;
        top: 0;
        position: fixed;
        -ms-scroll-chaining: none;
        transition: 300ms background-color ease-in-out;
        user-select: none;
        z-index: 20;

        &.fade-enter {
            background-color: rgba(0, 0, 0, 0);
        }

        &.fade-enter-active {
            background-color: rgba(0, 0, 0, 0.5);
        }

        &.fade-enter-done {
            background-color: rgba(0, 0, 0, 0.5);
        }

        &.fade-exit {
            background-color: rgba(0, 0, 0, 0.5);
        }

        &.fade-exit-active {
            background-color: rgba(0, 0, 0, 0);
        }

        &.fade-exit-done {
            background-color: rgba(0, 0, 0, 0);
        }
    `;
    });

const Divider = styled.div`
    height: 1px;
    width: auto;
    background-color: rgba(var(--center-channel-color-rgb), 0.08);
`;

const MenuItems = styled.div<{isMobile?: boolean; isSubmenu?: boolean}>(
    ({isMobile, isSubmenu}) => {
        return isMobile ?
            css`
              background-color: rgba(var(--sidebar-text-rgb));
              min-height: 340px;
              height: auto;
              border-radius: 8px 8px 0 0;
              max-height: 100vh;
              overflow-y: auto;
              transform: ${isSubmenu ?
        'translateX(100%)' :
        'translateY(100%)'};
                transition: transform 300ms ease-in-out 0ms;
                transition: transform 300ms 0ms ease-in-out,
                visibility 300ms 0ms step-end;

                &.isParent.open {
                    transform: translateY(0);
                }

                &.open.isSubmenu {
                    position: relative;
                    transform: translateX(0%);
                    visibility: visible;

                    &.isParent {
                        transform: translateX(-100%);
                        visibility: hidden;
                    }
                }
          ` :
            css`
              border-radius: 4px;
              background-color: rgba(var(--sidebar-text-rgb));
              padding: 1rem 0;
              transform: scale(0);
              opacity: 0;
              box-shadow: 0px 20px 32px rgba(0, 0, 0, 0.12);
              transition: opacity 300ms ease-in-out 0ms,
                  transform 300ms ease-in-out 0ms;
              max-height: 100vh;
              min-width: 200px;
              overflow-y: auto;
              position: absolute;
              &.open {
                  transform: scale(1);
                  opacity: 1;
              }
          `;
    },
);

const MenuHeader = styled.div`
    display: none;

    &.isMobile {
        display: flex;
        justify-content: center;
        border-bottom: 1px solid #e0e0e0;
        height: 52px;
    }

    &.hasArrow {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
    }
`;

const MenuTitle = styled.div`
    display: flex;
    align-items: center;
    color: var(--center-channel-color);
`;

export {Overlay, Divider, MenuHeader, MenuItems, MenuTitle};
