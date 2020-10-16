// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {setSelectionRange} from 'utils/utils';

import QuickInputTextbox from './quick_input_textbox';
import ClearableTooltip from './clearable_tooltip';
import {useRefHandler} from './use_ref_handler';
import {QuickInputState} from './quick_input_state';

interface IQuickInputProps{
    delayInputUpdate?: boolean;

    /**
     * An optional React component that will be used instead of an HTML input when rendering
     */
    inputComponent?: any ;

    /**
     * The string value displayed in this input
     */
    value: string;

    /**
     * When true, and an onClear callback is defined, show an X on the input field that clears
     * the input when clicked.
     */
    clearable?: boolean;

    /**
     * The optional tooltip text to display on the X shown when clearable. Pass a components
     * such as FormattedMessage to localize.
     */
    clearableTooltipText?: string | JSX.Element;

    /**om
     * Callback to clear the input value, and used in tandem with the clearable prop above.
     */
    onClear?: () => void;

    /**
     * Input event callback, for old API(using ref)
     */
    onChange?: (e: React.ChangeEvent<HTMLInputElement | any>) => void;
    onInput?: (e: React.ChangeEvent<HTMLInputElement | any>) => void;
    onCompositionUpdate?: (e: React.CompositionEvent<HTMLInputElement | any>) => void;
    onSelect?: (e: React.SyntheticEvent<HTMLInputElement, any>) => void;
    onCompositionStart?: () => void;
    onCompositionEnd?: () => void;
    onKeyDown?: (e: KeyboardEvent) => void;

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

const QuickInput = React.forwardRef((props: IQuickInputProps, ref) => {
    //reference to quick input text box
    const inputRef = React.useRef<HTMLInputElement | any>();

    //callback to clear the quick input textbox
    const onClear = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (props.onClear) {
            props.onClear();
        }
        inputRef.current?.focus();
    }, [props.onClear, inputRef]);

    // old API for ref
    useRefHandler(ref, inputRef);

    const {
        value, inputComponent, clearable,
        onSelect, onCompositionUpdate, onChange, // old callbacks
        // new callbacks
        quickInputState, onTextboxChange, onTextboxSelect, onTextboxCompositionUpdate,
        ...remainedProps
    } = props;

    //set selection for input
    React.useEffect(() => {
        if (quickInputState) {
            const {selectionStart, selectionEnd} = quickInputState.getSelection();
            setSelectionRange(inputRef.current, selectionStart, selectionEnd);
        }
    }, [
        quickInputState?.getSelection().selectionStart,
        quickInputState?.getSelection().selectionEnd,
    ]);

    Reflect.deleteProperty(remainedProps, 'delayInputUpdate');
    Reflect.deleteProperty(remainedProps, 'onClear');
    Reflect.deleteProperty(remainedProps, 'clearableTooltipText');
    Reflect.deleteProperty(remainedProps, 'channelId');

    return (<div>
        <QuickInputTextbox
            ref={inputRef}
            value={value}
            inputComponent={inputComponent}

            // old API
            onSelect={onSelect}
            onChange={onChange}
            onCompositionUpdate={onCompositionUpdate}

            // new API
            quickInputState={quickInputState}
            onTextboxSelect={onTextboxSelect}
            onTextboxCompositionUpdate={onTextboxCompositionUpdate}
            onTextboxChange={onTextboxChange}
            {...remainedProps}
        />
        <ClearableTooltip
            clearable={clearable}
            onClear={onClear}
            value={quickInputState?.getValue() || value}
        />
    </div>);
});

export default QuickInput;

export {QuickInputState};

QuickInput.defaultProps = {
    delayInputUpdate: false,
    value: '',
    clearable: false,
    quickInputState: QuickInputState.createNew(),
};
