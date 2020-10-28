// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import EventEmitter from 'mattermost-redux/utils/event_emitter';

import QuickInput, {QuickInputState} from '../../quick_input';

import {useRefHandler} from './use_ref_handler';
import {useContainerRef} from './use_container_ref';
import {useSuggestionHandler} from './use_suggestion_handler';
import {useInputModifier} from './use_input_modifier';
import {useInputHandler} from './use_input_handler';
import {ISuggestionBoxProps, ISuggestionBoxState} from './types';

const SuggestionBox = React.forwardRef((props: ISuggestionBoxProps, ref) => {
    const qInputRef = React.useRef<HTMLInputElement | any>(null);

    const suggestionReadOut = React.useRef<HTMLDivElement>(null);
    const [suggestionBoxState, setSuggestionBoxState] = React.useState<ISuggestionBoxState>({
        focused: false,
        matchedPretext: [],
        items: [],
        terms: [],
        components: [],
        selection: '',
        allowDividers: true,
        presentationType: 'text',
    });

    const updateSuggestionBoxState = React.useCallback(
        /*eslint max-nested-callbacks: [0]*/
        (newState: Partial<ISuggestionBoxState>) => setSuggestionBoxState((oldState) => ({
            ...oldState, ...newState,
        })),
        [],
    );

    const [qInputState, setQInputState] = React.useState(QuickInputState.createNew({
        value: props.value || '',
    }));

    const qInputRefHandler = useRefHandler(ref, qInputRef);
    const qInputModifier = useInputModifier(props);

    const pretextRef = React.useRef<string>('');
    const preventSuggestionListCloseFlag = React.useRef<boolean>(false);
    const timeoutIdRef = React.useRef<NodeJS.Timeout >();

    const suggestionHandlerRef = useSuggestionHandler(
        pretextRef, timeoutIdRef, props, suggestionBoxState,
        updateSuggestionBoxState, setQInputState, qInputModifier, qInputRefHandler,
    );

    /*eslint max-nested-callbacks: [0]*/
    React.useEffect(() => {
        const {value} = props;
        setQInputState((prevState) => {
            if (prevState.getValue() !== value) {
                return QuickInputState.replace(prevState, {
                    value: value.toLowerCase(),
                });
            }
            return prevState;
        });
    }, [props.value]);

    React.useEffect(() => {
        const pretext = qInputState.
            getValue().
            substring(0, qInputState.getSelection().selectionEnd || undefined).
            toLowerCase();

        if (pretextRef.current !== pretext && !composingFlag.current) {
            suggestionHandlerRef.current.handlePretextChanged(pretext);
        }
    }, [props.contextId, qInputState.getValue(), qInputState.getSelection().selectionEnd]);

    const handleMentionKeyClick = React.useCallback(
        (qIState: QuickInputState, mentionKey: string, isRHS: boolean) => {
            if (props.isRHS !== isRHS) {
                return;
            }
            let insertText = '@' + mentionKey;

            // if the current text does not end with a whitespace, then insert a space
            if (qInputState.getValue() && (/[^\s]$/).test(qInputState.getValue())) {
                insertText = ' ' + insertText;
            }

            qInputModifier.addTextAtCaret(qIState, insertText, '');
        },
        [props.isRHS],
    );
    React.useEffect(() => {
        if (props.listenForMentionKeyClick) {
            EventEmitter.addListener('mention_key_click', handleMentionKeyClick);
        }
        return () => {
            EventEmitter.removeListener('mention_key_click', handleMentionKeyClick);
        };
    }, [handleMentionKeyClick, props.listenForMentionKeyClick]);

    const composingFlag = React.useRef(false);
    const qInputHandler = useInputHandler(
        composingFlag, pretextRef, timeoutIdRef,
        props, suggestionBoxState,
        setQInputState, updateSuggestionBoxState,
        suggestionHandlerRef, qInputRefHandler,
    );

    const containerRef = useContainerRef(
        qInputRef, preventSuggestionListCloseFlag, pretextRef,
        qInputState, props,
        updateSuggestionBoxState, suggestionHandlerRef,
    );

    const {
        dateComponent: SuggestionDateComponent,
        listComponent: SuggestionListComponent,
        ...remainedProps
    } = props;

    return (
        <div
            ref={containerRef}
            className={props.containerClass}
        >
            <div
                ref={suggestionReadOut}
                aria-live='polite'
                role='alert'
                className='sr-only'
            />
            <QuickInput
                {...passPropsToQuickInput(remainedProps as ISuggestionBoxProps)}
                value={props.value}
                ref={qInputRef}
                quickInputState={qInputState}

                //onChange={qInputHandler.handleChange}
                onInput={qInputHandler.handleChange}
                onCompositionStart={qInputHandler.handleCompositionStart}
                onCompositionUpdate={qInputHandler.handleCompositionUpdate}
                onCompositionEnd={qInputHandler.handleCompositionEnd}
                onSelect={qInputHandler.handleSelect}
                onKeyDown={qInputHandler.handleKeyDown}
                onTextboxChange={qInputHandler.handleTextboxChange}
                onTextboxSelect={setQInputState}
            />
            {(props.openWhenEmpty || props.value.length >= (props.requiredCharacters || 1)) &&
                suggestionBoxState.presentationType === 'text' &&
                <div>
                    <SuggestionListComponent
                        ariaLiveRef={suggestionReadOut}
                        open={suggestionBoxState.focused || props.forceSuggestionsWhenBlur}
                        pretext={pretextRef.current}
                        location={props.listStyle}
                        renderDividers={props.renderDividers}
                        renderNoResults={props.renderNoResults}
                        onCompleteWord={suggestionHandlerRef.current.handleCompleteWord}
                        preventClose={() => {
                            preventSuggestionListCloseFlag.current = false;
                        }}
                        onItemHover={suggestionHandlerRef.current.setSelection}
                        cleared={checkedStateCleared(suggestionBoxState)}
                        matchedPretext={suggestionBoxState.matchedPretext}
                        items={suggestionBoxState.items}
                        terms={suggestionBoxState.terms}
                        selection={suggestionBoxState.selection}
                        components={suggestionBoxState.components}
                        wrapperHeight={props.wrapperHeight}
                        inputRef={qInputRef}
                        onLoseVisibility={qInputRefHandler.blur}
                    />
                </div>
            }
            {(props.openWhenEmpty || props.value.length >= (props.requiredCharacters || 1)) &&
            suggestionBoxState.presentationType === 'date' &&
                <SuggestionDateComponent
                    items={suggestionBoxState.items}
                    terms={suggestionBoxState.terms}
                    components={suggestionBoxState.components}
                    matchedPretext={suggestionBoxState.matchedPretext}
                    onCompleteWord={suggestionHandlerRef.current.handleCompleteWord}
                />
            }
        </div>

    );
});

export default SuggestionBox;

SuggestionBox.defaultProps = {
    listStyle: 'top',
    containerClass: '',
    renderDividers: false,
    renderNoResults: false,
    completeOnTab: true,
    isRHS: false,
    requiredCharacters: 1,
    openOnFocus: false,
    openWhenEmpty: false,
    replaceAllInputOnSelect: false,
    listenForMentionKeyClick: false,
    forceSuggestionsWhenBlur: false,
};

function checkedStateCleared(state: ISuggestionBoxState): boolean {
    const {matchedPretext, selection, items, terms, components} = state;
    return (!matchedPretext || !matchedPretext.length) &&
        (!selection) &&
        (!items || !items.length) &&
        (!components || !components.length) &&
        (!terms || !terms.length);
}

function passPropsToQuickInput(props: ISuggestionBoxProps) {
    const passedProps: any = {...props};
    delete passedProps.providers;
    delete passedProps.onChange; // We use onInput instead of onChange on the actual input
    delete passedProps.onComposition;
    delete passedProps.onItemSelected;
    delete passedProps.completeOnTab;
    delete passedProps.isRHS;
    delete passedProps.requiredCharacters;
    delete passedProps.openOnFocus;
    delete passedProps.openWhenEmpty;
    delete passedProps.onFocus;
    delete passedProps.onBlur;
    delete passedProps.containerClass;
    delete passedProps.replaceAllInputOnSelect;
    delete passedProps.renderDividers;
    delete passedProps.contextId;
    delete passedProps.listenForMentionKeyClick;
    delete passedProps.wrapperHeight;
    delete passedProps.forceSuggestionsWhenBlur;
    delete passedProps.onSuggestionsReceived;
    return passedProps;
}
