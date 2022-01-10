import React from "react";
import { usePopper } from "react-popper";

const MenuPopover = ({
    triggerRef,
    isVisible,
    isMobile,
    placement = "auto",
    offset = [0, 4],
    children,
}) => {
    const [popperElement, setPopperElement] = React.useState(null);

    const {
        styles: { popper },
        attributes,
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

    const mobileStyle = isMobile && {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        transition: "visibility 200ms 0ms step-end",
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
