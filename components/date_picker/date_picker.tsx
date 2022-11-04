import React, { ChangeEventHandler, useEffect, useRef, useState } from 'react';

import FocusTrap from 'focus-trap-react';
import { DayPicker } from 'react-day-picker';
import { usePopper } from 'react-popper';

import './date_picker.scss';

type Props = {
    children: React.ReactNode;
    datePickerProps: any;
    isPopperOpen: boolean;
    closePopper: () => void;
}

const DatePicker = ({children, datePickerProps, isPopperOpen, closePopper}: Props) => {
    const popperRef = useRef<HTMLDivElement>(null);
    // const buttonRef = useRef<HTMLButtonElement>(null);
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
        null
    );

    const popper = usePopper(popperRef.current, popperElement, {
        placement: 'bottom-start'
    });

    // const closePopper = () => {
    //     setIsPopperOpen(false);
    //     buttonRef?.current?.focus();
    // };

    useEffect(() => {
        console.log(popperRef)
        if (isPopperOpen && !popperRef?.current) {
            closePopper();
        }
    }, [popperRef]);

    return (
        <div>
            <div ref={popperRef}>
                {children}
            </div>
            {isPopperOpen && (
                <FocusTrap
                    active
                    focusTrapOptions={{
                        initialFocus: false,
                        allowOutsideClick: true,
                        clickOutsideDeactivates: true,
                        onDeactivate: closePopper,
                        // fallbackFocus: buttonRef.current
                    }}
                >
                    <div
                        tabIndex={-1}
                        style={popper.styles.popper}
                        className="date-picker__popper"
                        {...popper.attributes.popper}
                        ref={setPopperElement}
                        role="dialog"
                    >
                        <DayPicker
                            {...datePickerProps}
                        />
                    </div>
                </FocusTrap>
            )}
        </div>
    );
}

export default DatePicker;
