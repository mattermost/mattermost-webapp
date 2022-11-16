// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react';

import FocusTrap from 'focus-trap-react';
import {DayPicker, DayPickerProps} from 'react-day-picker';
import {usePopper} from 'react-popper';

import type {Locale} from 'date-fns';

import './date_picker.scss';

type Props = {
    children: React.ReactNode;
    datePickerProps: DayPickerProps;
    isPopperOpen: boolean;
    locale: string;
    closePopper: () => void;
}

const DatePicker = ({children, datePickerProps, isPopperOpen, closePopper, locale}: Props) => {
    const loadedLocales: Record<string, Locale> = {};
    const popperRef = useRef<HTMLDivElement>(null);
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
        null,
    );

    const popper = usePopper(popperRef.current, popperElement, {
        placement: 'bottom-start',
    });

    const localeExists = (path: string) => {
        try {
            require.resolve(path);
            return true;
        } catch (e) {
            return false;
        }
    };

    useEffect(() => {
        if (isPopperOpen && !popperRef?.current) {
            closePopper();
        }
    }, [popperRef]);

    useEffect(() => {
        if (locale && locale !== 'en-US' && !loadedLocales[locale] && localeExists(`date-fns/locale/${locale}/index.js`)) {
            /* eslint-disable global-require */
            loadedLocales[locale] = require(`date-fns/locale/${locale}/index.js`);
            /* eslint-disable global-require */
        }
    }, []);

    return (
        <div>
            <div ref={popperRef}>
                {children}
            </div>
            {isPopperOpen && (
                <FocusTrap
                    active={true}
                    focusTrapOptions={{
                        initialFocus: false,
                        allowOutsideClick: true,
                        clickOutsideDeactivates: true,
                        onDeactivate: closePopper,
                    }}
                >
                    <div
                        tabIndex={-1}
                        style={popper.styles.popper}
                        className='date-picker__popper'
                        {...popper.attributes.popper}
                        ref={setPopperElement}
                        role='dialog'
                    >
                        <DayPicker
                            {...datePickerProps}
                            locale={loadedLocales[locale]}
                        />
                    </div>
                </FocusTrap>
            )}
        </div>
    );
};

export default DatePicker;
