import { Placement } from "popper.js";
import { Instance } from "@popperjs/core";
import React, { useEffect } from "react";
import { usePopper } from "react-popper";

import { MENU_APPEAR_TRANSITION_DURATION } from "./Menu";

export const useUpdateOnVisibilityChange = (
    update: Instance["update"] | null,
    isVisible: boolean
) => {
    const updateComponent = async () => {
        if (!update) {
            return;
        }
        await update();
    };

    useEffect(() => {
        if (!isVisible) {
            return;
        }
        updateComponent();
    }, [isVisible]);
};

interface MenuPopoverProps {
    triggerRef: React.RefObject<HTMLElement>;
    isVisible: boolean;
    isMobile: boolean;
    placement?: Placement;
    offset?: [number | null | undefined, number | null | undefined];
    children?: React.ReactNode;
}

const MenuPopover = ({
    triggerRef,
    isVisible,
    isMobile,
    placement = "auto",
    offset = [0, -4],
    children,
}: MenuPopoverProps): JSX.Element | null => {
    const [popperElement, setPopperElement] =
        React.useState<HTMLDivElement | null>(null);

    const {
        styles: { popper },
        attributes,
        update,
    } = usePopper(triggerRef.current, popperElement, {
        placement: placement,
        modifiers: [
            {
                name: "offset",
                options: {
                    offset: offset,
                },
            },
        ],
    });
    useUpdateOnVisibilityChange(update, isVisible);

    const mobileStyle = isMobile && {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        transition: `visibility ${MENU_APPEAR_TRANSITION_DURATION}ms 0ms step-end`,
    };

    const style = {
        zIndex: isVisible ? 0 : -1,
    };

    Object.assign(style, mobileStyle || popper);

    return (
        <div ref={setPopperElement} style={style} {...attributes.popper}>
            {children}
        </div>
    );
};

export default MenuPopover;
