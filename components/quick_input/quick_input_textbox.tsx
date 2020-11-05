// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import AutosizeTextarea from 'components/autosize_textarea';

import {QuickInputState} from './quick_input_state';

interface IQInputTextboxProps{

    // text box value attribute, this is old API. New api migrate this props to quickInputState
    value: string;

    // initial element to render QuickInputTextbox
    inputComponent: any,

    /**
     * Input event callback, for old API(using ref)
     */
    onChange?: (e: React.ChangeEvent<HTMLInputElement | any>) => void;
    onInput?: (e: React.ChangeEvent<HTMLInputElement | any>) => void;
    onCompositionUpdate?: (e: React.CompositionEvent<HTMLInputElement | any>) => void;
    onSelect?: (e: React.SyntheticEvent<HTMLInputElement, any>) => void;

    /**
     * Input event callback,for new API (using QuickInputState class to control)
     */
    quickInputState?: QuickInputState;
    onTextboxChange?: (qInputState: QuickInputState) => void;
    onTextboxCompositionUpdate?: (
        qInputState: QuickInputState, composingData: string | null | undefined
    ) => void;
    onTextboxSelect?: (qInputState: QuickInputState) => void;
}

const QuickInputTextbox = React.forwardRef((props: IQInputTextboxProps, ref) => {
    const defaultValueRef = React.useRef<string>(props.value);
    const {
        value, inputComponent,
        onSelect, onCompositionUpdate, onChange, // old callbacks
        // new callbacks
        quickInputState, onTextboxChange, onTextboxSelect, onTextboxCompositionUpdate,
        ...remainedProps
    } = props;

    if (inputComponent !== AutosizeTextarea) {
        Reflect.deleteProperty(remainedProps, 'onHeightChange');
    }

    return React.createElement(
        props.inputComponent || 'input',
        {
            ...remainedProps,
            defaultValue: defaultValueRef.current,
            ref,

            // add value as props (controlled components)
            value: quickInputState?.getValue() || value,

            // override default onChange event
            onChange: (e: React.ChangeEvent<HTMLInputElement | any>) => {
                // new API
                if (quickInputState && onTextboxChange) {
                    onTextboxChange(QuickInputState.replace(quickInputState, {
                        value: e.target.value,
                        selectionStart: e.target.selectionStart,
                        selectionEnd: e.target.selectionEnd,
                    }));
                }

                // old API
                if (onChange) {
                    onChange(e);
                }
            },

            // override onCompositionUpdate event
            onCompositionUpdate: (e: React.CompositionEvent<HTMLInputElement | any>) => {
                // new API
                if (quickInputState && onTextboxCompositionUpdate) {
                    onTextboxCompositionUpdate(quickInputState, e.data);
                }

                //old API
                if (onCompositionUpdate) {
                    onCompositionUpdate(e);
                }
            },

            // override onSelect event
            onSelect: (e: any) => {
                // new API
                if (quickInputState && onTextboxSelect) {
                    onTextboxSelect(QuickInputState.replace(quickInputState, {
                        selectionStart: e.target.selectionStart,
                        selectionEnd: e.target.selectionEnd,
                    }));
                }

                // old API
                if (onSelect) {
                    onSelect(e);
                }
            },
        },
    );
});

export default QuickInputTextbox;
