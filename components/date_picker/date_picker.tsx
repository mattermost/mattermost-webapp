// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';

import {DayPicker, DayPickerProps} from 'react-day-picker';
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    useInteractions,
    FloatingFocusManager,
    useDismiss,
} from '@floating-ui/react-dom-interactions';
import type {Locale} from 'date-fns';

import 'react-day-picker/dist/style.css';
import './date_picker.scss';

type Props = {
    children: React.ReactNode;
    datePickerProps: DayPickerProps;
    isPopperOpen: boolean;
    locale: string;
    handlePopperOpenState: (isOpen: boolean) => void;
}

const DatePicker = ({children, datePickerProps, isPopperOpen, handlePopperOpenState, locale}: Props) => {
    const loadedLocales: Record<string, Locale> = {};
    const {x, y, reference, floating, strategy, context} = useFloating({
        open: isPopperOpen,
        onOpenChange: () => handlePopperOpenState(false),
        placement: 'bottom',
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(5),
            flip({fallbackPlacements: ['bottom', 'right'], padding: 5}),
            shift(),
        ],
    });

    const {getReferenceProps, getFloatingProps} = useInteractions([
        useDismiss(context, {
            enabled: true,
            outsidePress: true,
        }),
    ]);

    const localeExists = (path: string) => {
        try {
            require.resolve(path);
            return true;
        } catch (e) {
            return false;
        }
    };

    useEffect(() => {
        if (locale && locale !== 'en-US' && !loadedLocales[locale] && localeExists(`date-fns/locale/${locale}/index.js`)) {
            /* eslint-disable global-require */
            loadedLocales[locale] = require(`date-fns/locale/${locale}/index.js`);
            /* eslint-disable global-require */
        }
    }, []);

    return (
        <div>
            <div 
                ref={reference}
                {...getReferenceProps()}
            >
                {children}
            </div>
            {isPopperOpen && (
                <FloatingFocusManager
                    context={context}
                    modal={true}
                    initialFocus={-1}
                >
                    <div
                        ref={floating}
                    >
                        <DayPicker
                            {...datePickerProps}
                            style={{
                                position: strategy,
                                top: y ?? 0,
                                left: x ?? 0,
                                width: 'auto',
                                zIndex: 999,
                            }}
                            className='date-picker__popper'
                            locale={loadedLocales[locale]}
                            {...getFloatingProps}
                        />
                    </div>
                    
                </FloatingFocusManager>
            )}
        </div>
    );
};

export default DatePicker;
