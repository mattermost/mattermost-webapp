// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable max-lines */

import React, {useEffect, useState, KeyboardEvent, FocusEvent, SyntheticEvent, ChangeEvent, useCallback, useImperativeHandle, MouseEvent, CSSProperties} from 'react';

// import _ from 'lodash';

import EventEmitter from 'mattermost-redux/utils/event_emitter';

import QuickInput from 'components/quick_input';
import Constants from 'utils/constants';
import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils';
import AppCommandProvider from '../command_provider/app_provider';
import {TextboxElement} from 'components/textbox';
import GenericUserProvider from 'components/suggestion/generic_user_provider.jsx';
import AtMentionProvider from '../at_mention_provider';
import ChannelMentionProvider from '../channel_mention_provider';
import CommandProvider from '../command_provider/command_provider';
import EmoticonProvider from '../emoticon_provider';
import SwitchChannelProvider from 'components/suggestion/switch_channel_provider.jsx';
import SuggestionProvider from 'components/suggestion/provider';

// import SuggestionList from 'components/suggestion/suggestion_list';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';

import SuggestionDate from '../suggestion_date';

const EXECUTE_CURRENT_COMMAND_ITEM_ID = Constants.Integrations.EXECUTE_CURRENT_COMMAND_ITEM_ID;
const OPEN_COMMAND_IN_MODAL_ITEM_ID = Constants.Integrations.OPEN_COMMAND_IN_MODAL_ITEM_ID;
const KeyCodes = Constants.KeyCodes;

import {
    getTextbox, addTextAtCaret, replaceText, ProviderSuggestions, handleMentionKeyClick,
    nonDebouncedPretextChanged, debouncedPretextChanged, clear, handleReceivedSuggestions, handleReceivedSuggestionsAndComplete, hasSuggestions, selectPrevious, selectNext, setSelection, handleChange} from './helpers';

export interface SuggestionBoxProps {
    id: string;

    /**
     * The list component to render, usually SuggestionList
     */
    listComponent?: typeof SuggestionList;

    /**
     * Where the list will be displayed relative to the input box, defaults to 'top'
     */
    listPosition?: 'top' | 'bottom';

    /**
     * The input component to render (it is passed through props to the QuickInput)
     */
    inputComponent?: React.ElementType;

    /**
     * The date component to render
     */
    dateComponent?: typeof SuggestionDate;

    /**
     * The value of in the input
     */
    value: string;

    /**
     * Array of suggestion providers
     */
    providers: Array<AtMentionProvider | ChannelMentionProvider | EmoticonProvider | AppCommandProvider | CommandProvider | GenericUserProvider | SwitchChannelProvider | SuggestionProvider>;

    /**
     * CSS class for the div parent of the input box
     */
    containerClass?: string;

    /**
     * Set to ['all'] to draw all available dividers, or use an array of the types of dividers to only render those
     * (e.g. [Constants.MENTION_RECENT_CHANNELS, Constants.MENTION_PUBLIC_CHANNELS]) between types of list items
     */
    renderDividers?: string[];

    /**
     * Set to true to render a message when there were no results found, defaults to false
     */
    renderNoResults?: boolean;

    /**
     * Set to true if we want the suggestions to take in the complete word as the pretext, defaults to false
     */
    shouldSearchCompleteText?: boolean;

    /**
     * Set to allow TAB to select an item in the list, defaults to true
     */
    completeOnTab?: boolean;

    /**
     * Function called when input box gains focus
     */
    onFocus?: (e: FocusEvent<TextboxElement | HTMLDivElement>) => void | undefined;

    /**
     * Function called when input box loses focus
     */
    onBlur?: (e: FocusEvent<TextboxElement | HTMLDivElement>) => void | undefined;

    /**
     * Function called when input box value changes
     */
    onChange?: (e: string) => void;

    /**
     * Function called when a key is pressed and the input box is in focus
     */
    onKeyDown?: ((e: KeyboardEvent<TextboxElement | HTMLDivElement> | ChangeEvent<HTMLInputElement>) => void) | ((e: ChangeEvent<HTMLInputElement>) => void) | undefined;

    // onKeyPress?: (e: KeyboardEvent<any> | KeyboardEvent<Element> | globalThis.KeyboardEvent | KeyboardEvent) => void | undefined;
    onKeyPress?: (e: KeyboardEvent<any>) => void;

    onComposition?: (() => void) | undefined;
    onSelect?: (e: SyntheticEvent<TextboxElement>) => void | undefined;
    onSearchTypeSelected?(...args: unknown[]): unknown;

    /**
     * Function called when an item is selected
     */
    onItemSelected?: (...args: any[]) => void;

    /**
     * Flags if the suggestion_box is for the RHS (Reply).
     */
    isRHS?: boolean;

    /**
     * The number of characters required to show the suggestion list, defaults to 1
     */
    requiredCharacters?: number;

    /**
     * If true, the suggestion box is opened on focus, default to false
     */
    openOnFocus?: boolean;

    /**
     * If true, the suggestion box is disabled
     */
    disabled?: boolean;

    /**
     * If true, it displays allow to display a default list when empty
     */
    openWhenEmpty?: boolean;

    /**
     * If true, replace all input in the suggestion box with the selected option after a select, defaults to false
     */
    replaceAllInputOnSelect?: boolean;

    /**
     * An optional, opaque identifier that distinguishes the context in which the suggestion
     * box is rendered. This allows the reused component to otherwise respond to changes.
     */
    contextId?: string;

    /**
     * If true, listen for clicks on a mention and populate the input with said mention, defaults to false
     */
    listenForMentionKeyClick?: boolean;

    /**
     * Allows parent to access received suggestions
     */
    onSuggestionsReceived?: (suggestions: ProviderSuggestions) => void;

    /**
     * To show suggestions even when focus is lost
     */
    forceSuggestionsWhenBlur?: boolean;
    actions?: {
        addMessageIntoHistory(...args: unknown[]): unknown;
    };
    className?: string;
    spellCheck?: 'true' | 'false';
    placeholder?: string;
    onMouseUp?: (e: MouseEvent<TextboxElement>) => void | undefined;
    onKeyUp?: (e: KeyboardEvent<TextboxElement>) => void | undefined;
    onHeightChange?: (height: number, maxHeight: number) => void | undefined;
    onPaste?: React.ClipboardEventHandler<Element> | undefined;
    style?: CSSProperties;
    channelId?: string;
    maxLength?: '64';
    delayInputUpdate?: boolean;
    tabIndex?: string;
    type?: 'search';
    clearable?: boolean;
    onClear?: () => void;
}

type SuggestionBoxAlign ={
    pixelsToMoveX: number;
    pixelsToMoveY: number;
    lineHeight?: undefined;
    placementShift?: undefined;
} | {
    pixelsToMoveX: number;
    pixelsToMoveY: number;
    lineHeight: number;
    placementShift: boolean;
}

export const defaultState = {
    focused: false,
    cleared: true,
    matchedPretext: [] as Array<ProviderSuggestions['matchedPretext']>,
    items: [] as ProviderSuggestions['items'],
    terms: [] as ProviderSuggestions['terms'],
    components: [] as Array<React.Component<{item: Record<string, unknown>}>>,
    selection: '',
    selectionIndex: 0,
    allowDividers: true,
    presentationType: 'text',
    suggestionBoxAlgn: undefined as SuggestionBoxAlign | undefined,
};

export type SuggestionBoxForwarded = {
    getTextbox: () => HTMLInputElement | HTMLTextAreaElement | null;
    focus: () => void;
    blur: () => void;
}

const SuggestionBoxComponent: React.ForwardRefRenderFunction<SuggestionBoxForwarded, SuggestionBoxProps> = ({
    listPosition = 'top',
    containerClass = '',
    renderDividers = [],
    renderNoResults = false,
    shouldSearchCompleteText = false,
    completeOnTab = true,
    isRHS = false,
    requiredCharacters = 1,
    openOnFocus = false,
    openWhenEmpty = false,
    replaceAllInputOnSelect = false,
    listenForMentionKeyClick = false,
    forceSuggestionsWhenBlur = false,
    value,
    onChange,
    onItemSelected,
    onSuggestionsReceived,
    providers,
    actions,
    onKeyPress,
    onComposition,
    onSelect,
    onKeyDown,
    onFocus,
    onBlur,
    dateComponent,
    listComponent,
    contextId,

    // onHeightChange,
    ...props
}: SuggestionBoxProps, ref) => {
    const suggestionReadOut = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Keep track of whether we're composing a CJK character so we can make suggestions for partial characters
    const [isComposing, setIsComposing] = useState(false);
    const [pretext, setPretext] = useState('');

    // const pretext = '';

    // Used for debouncing pretext changes
    // let timeoutId: NodeJS.Timeout | undefined;
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(undefined);

    // Used for preventing suggestion list to close when scrollbar is clicked
    const [preventSuggestionListCloseFlag, setPreventSuggestionListCloseFlag] = useState(false);

    // pretext: the text before the cursor
    // matchedPretext: a list of the text before the cursor that will be replaced if the corresponding autocomplete term is selected
    // terms: a list of strings which the previously typed text may be replaced by
    // items: a list of objects backing the terms which may be used in rendering
    // components: a list of react components that can be used to render their corresponding item
    // selection: the term currently selected by the keyboard
    const [state, setState] = useState(() => defaultState);
    const [prevContextId, updatePrevContextId] = useState<string | undefined>(undefined);

    const handleCompleteWord = (
        term: string,
        matchedPretext: string,
        e?: React.KeyboardEvent | globalThis.KeyboardEvent,
    ) => {
        let fixedTerm = term;
        let finish = false;
        let openCommandInModal = false;
        if (term.endsWith(EXECUTE_CURRENT_COMMAND_ITEM_ID)) {
            fixedTerm = term.substring(0, term.length - EXECUTE_CURRENT_COMMAND_ITEM_ID.length);
            finish = true;
        }

        if (term.endsWith(OPEN_COMMAND_IN_MODAL_ITEM_ID)) {
            fixedTerm = term.substring(0, term.length - OPEN_COMMAND_IN_MODAL_ITEM_ID.length);
            finish = true;
            openCommandInModal = true;
        }

        if (!finish) {
            if (replaceAllInputOnSelect) {
                replaceText(fixedTerm, inputRef, onChange);
            } else {
                addTextAtCaret(fixedTerm, matchedPretext, value, inputRef, onChange);
            }
        }

        if (onItemSelected) {
            const items = state.items;
            const terms = state.terms;
            for (let i = 0; i < terms.length; i++) {
                if (terms[i] === fixedTerm) {
                    onItemSelected(items[i]);
                    break;
                }
            }
        }

        clear(setState, state);

        if (openCommandInModal) {
            const appProvider = providers.find((p) => p instanceof AppCommandProvider) as AppCommandProvider | undefined;
            if (!appProvider) {
                return false;
            }
            appProvider.openAppsModalFromCommand(fixedTerm);
            if (actions) {
                actions.addMessageIntoHistory(fixedTerm);
            }
            if (inputRef && inputRef.current) {
                inputRef.current.value = '';
                handleChange(inputRef.current.value, inputRef, shouldSearchCompleteText, isComposing, pretext, setPretext, onChange);
            }

            return false;
        }

        if (inputRef && inputRef.current) {
            inputRef.current.focus();
        }

        if (finish && onKeyPress) {
            let ke = e;
            if (!e || Utils.isKeyPressed(e, Constants.KeyCodes.TAB)) {
                ke = new KeyboardEvent('keydown', {
                    bubbles: true, cancelable: true, keyCode: 13,
                });
                if (e) {
                    e.preventDefault();
                }
            }
            if (ke) {
                onKeyPress(ke);
            }
            return true;
        }

        if (!finish) {
            for (const provider of providers) {
                if (provider instanceof CommandProvider) {
                    provider.handleCompleteWord(fixedTerm, matchedPretext, (temp: string) => setPretext(temp));
                }
            }
        }
        return false;
    };

    const handlePretextChanged = (
        tempPretext: string,
    ) => {
        debouncedPretextChanged(
            tempPretext,
            timeoutId, setTimeoutId, state, inputRef, setState,
            (suggestions: ProviderSuggestions) => handleReceivedSuggestions(suggestions, setState, state, onSuggestionsReceived),
            (suggestions: ProviderSuggestions) => handleReceivedSuggestionsAndComplete(suggestions, setState, state, handleCompleteWord, onSuggestionsReceived),
            providers,
        );
    };

    const handleEmitClearSuggestions = useCallback((delay = 0) => {
        setTimeout(() => {
            clear(setState, state);
        }, delay);
    }, [state]);

    const preventSuggestionListClose = () => {
        setPreventSuggestionListCloseFlag(true);
    };

    const handleCompositionStart = () => {
        setIsComposing(true);
        if (onComposition) {
            onComposition();
        }
    };

    const handleCompositionEnd = () => {
        setIsComposing(true);
        if (onComposition) {
            onComposition();
        }
    };

    const handleCompositionUpdate = (e: {data: string}) => {
        if (!e.data) {
            return;
        }

        // The caret appears before the CJK character currently being composed, so re-add it to the pretext
        const textbox = getTextbox(inputRef);
        if (!textbox) {
            return;
        }
        const tempPretext = textbox.value.substring(0, textbox.selectionStart || undefined) + e.data;

        setPretext(tempPretext);
        if (onComposition) {
            onComposition();
        }
    };

    const handleSelect = (e: React.SyntheticEvent<TextboxElement>) => {
        if (onSelect) {
            onSelect(e);
        }
    };

    const getListPosition = (listPosition: SuggestionBoxProps['listPosition']) => {
        if (!state.suggestionBoxAlgn) {
            return listPosition;
        }

        return listPosition === 'bottom' && state.suggestionBoxAlgn.placementShift ? 'top' : listPosition;
    };

    const focus = () => {
        const input = inputRef.current;
        if (!input) {
            return;
        }
        if (input.value === '""' || input.value.endsWith('""')) {
            input.selectionStart = input.value.length - 1;
            input.selectionEnd = input.value.length - 1;
        } else {
            input.selectionStart = input.value.length;
        }
        input.focus();

        handleChange(input.value, inputRef, shouldSearchCompleteText, isComposing, pretext, setPretext, onChange);
    };

    const blur = () => {
        if (inputRef && inputRef.current) {
            inputRef.current.blur();
        }
    };

    const handleFocusOut = useCallback((e: FocusEvent<HTMLDivElement | TextboxElement>) => {
        // what's the point of this?
        if (preventSuggestionListCloseFlag) {
            setPreventSuggestionListCloseFlag(false);
            return;
        }

        // Focus is switching TO e.relatedTarget, so only treat this as a blur event if we're not switching
        // between children (like from the textbox to the suggestion list)
        if (containerRef && containerRef?.current?.contains(e.relatedTarget as Node)) {
            return;
        }

        if (UserAgent.isIos() && !e.relatedTarget) {
            // On Safari and iOS classic app, the autocomplete stays open
            // when you tap outside of the post textbox or search box.
            return;
        }

        if (!forceSuggestionsWhenBlur) {
            handleEmitClearSuggestions();
        }

        setState((prevState) => ({...prevState, focused: false}));

        if (onBlur) {
            onBlur(e);
        }
    }, [handleEmitClearSuggestions, onBlur, setState, forceSuggestionsWhenBlur, containerRef, preventSuggestionListCloseFlag]);

    const handleFocusIn = useCallback((e: FocusEvent<HTMLDivElement | TextboxElement>) => {
        // Focus is switching FROM e.relatedTarget, so only treat this as a focus event if we're not switching
        // between children (like from the textbox to the suggestion list). PreventSuggestionListCloseFlag is
        // checked because if true, it means that the focusIn comes from a click in the suggestion box, an
        // option choice, so we don't want the focus event to be triggered
        if (containerRef && (containerRef?.current?.contains(e.relatedTarget as Node) || preventSuggestionListCloseFlag)) {
            return;
        }

        setState((prevState) => ({...prevState, focused: true}));

        if (openOnFocus || openWhenEmpty) {
            setTimeout(() => {
                const textbox = getTextbox(inputRef);
                if (textbox) {
                    const textboxPretext = textbox.value.substring(0, textbox.selectionEnd || undefined);
                    if (openWhenEmpty || pretext.length >= requiredCharacters) {
                        if (textboxPretext !== pretext) {
                            setPretext(pretext);
                        }
                    }
                }
            });
        }

        if (onFocus) {
            onFocus(e);
        }
    }, [containerRef, onFocus, setState, pretext, preventSuggestionListCloseFlag, inputRef, openOnFocus, openWhenEmpty, requiredCharacters]);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement | TextboxElement>) => {
        console.log({
            openWhenEmpty,
            value,
            suggestion: hasSuggestions(state.items),
            terms: state.terms,
        });
        if ((openWhenEmpty || value)) {
            console.log('keydown triggered');

            const ctrlOrMetaKeyPressed = e.ctrlKey || e.metaKey;
            if (Utils.isKeyPressed(e, KeyCodes.UP)) {
                selectPrevious(state.terms, state.selection, setState);
                e.preventDefault();
            } else if (Utils.isKeyPressed(e, KeyCodes.DOWN)) {
                selectNext(state.terms, state.selection, setState);
                e.preventDefault();
            } else if (
                (Utils.isKeyPressed(e, KeyCodes.ENTER) && !ctrlOrMetaKeyPressed) ||
                (completeOnTab && Utils.isKeyPressed(e, KeyCodes.TAB))
            ) {
                let matchedPretext = '';
                for (let i = 0; i < state.terms.length; i++) {
                    if (state.terms[i] === state.selection) {
                        matchedPretext = state.matchedPretext[i];
                    }
                }

                // If these don't match, the user typed quickly and pressed enter before we could
                // update the pretext, so update the pretext before completing
                if (pretext.toLowerCase().endsWith(matchedPretext.toLowerCase())) {
                    if (handleCompleteWord(state.selection, matchedPretext, e)) {
                        return;
                    }
                } else {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    nonDebouncedPretextChanged(
                        pretext,
                        true,
                        providers,
                        state,
                        inputRef,
                        setState,
                        (suggestions: ProviderSuggestions) => handleReceivedSuggestions(suggestions, setState, state, onSuggestionsReceived),
                        (suggestions: ProviderSuggestions) => handleReceivedSuggestionsAndComplete(suggestions, setState, state, handleCompleteWord, onSuggestionsReceived),
                    );
                }

                if (onKeyDown) {
                    onKeyDown(e);
                }
                e.preventDefault();
            } else if (Utils.isKeyPressed(e, KeyCodes.ESCAPE)) {
                clear(setState, state);
                setState((prevState) => ({...prevState, presentationType: 'text'}));
                e.preventDefault();
                e.stopPropagation();
            } else if (onKeyDown) {
                onKeyDown(e);
            }
        } else if (onKeyDown) {
            onKeyDown(e);
        }
    };

    useEffect(() => {
        console.log({pretext});

        handlePretextChanged(pretext);
    }, [pretext]);

    useEffect(() => {
        // Attach/detach event listeners that aren't supported by React
        if (containerRef && containerRef.current) {
            containerRef.current.removeEventListener('focusin', handleFocusIn);
            containerRef.current.removeEventListener('focusout', handleFocusOut);
        }

        if (containerRef && containerRef.current) {
            containerRef.current.addEventListener('focusin', handleFocusIn);
            containerRef.current.addEventListener('focusout', handleFocusOut);
        }
    }, [containerRef, handleFocusIn, handleFocusOut]);

    useEffect(() => {
        if (value === '' && pretext !== value) {
            setPretext(pretext);
        }
        if (listenForMentionKeyClick) {
            EventEmitter.addListener(
                'mention_key_click',
                (mentionKey: string) => handleMentionKeyClick(mentionKey, value, isRHS, inputRef),
            );
        }
        return () => {
            EventEmitter.removeListener(
                'mention_key_click',
                (mentionKey: string) => handleMentionKeyClick(mentionKey, value, isRHS, inputRef),
            );
        };
    }, [listenForMentionKeyClick, pretext, inputRef, isRHS, value]);

    useEffect(() => {
        if (value === '' && pretext !== value) {
            setPretext(pretext);
        }

        if (contextId !== prevContextId) {
            updatePrevContextId(contextId);
            const textbox = getTextbox(inputRef);
            if (textbox) {
                const pretext = textbox.value.substring(0, textbox.selectionEnd || undefined).toLowerCase();
                setPretext(pretext);
            }
        }
    }, [value, contextId, pretext, prevContextId, inputRef]);

    // // This needs to be upper case so React doesn't think it's an html tag
    const SuggestionListComponent = listComponent;
    const SuggestionDateComponent = dateComponent;

    useImperativeHandle(ref, () => ({
        getTextbox: () => getTextbox(inputRef),
        focus: () => focus(),
        blur: () => blur(),
    }));

    return (
        <div
            ref={containerRef}
            className={containerClass}
        >
            <div
                ref={suggestionReadOut}
                aria-live='polite'
                role='alert'
                className='sr-only'
            />
            <QuickInput
                ref={inputRef}
                value={value}
                onInput={(value) => handleChange(value, inputRef, shouldSearchCompleteText, isComposing, pretext, setPretext, onChange)}

                // onHeightChange={onHeightChange}

                /**
                 * None of these are used in the Quickinput component, or anywhere else directly. but existed before
                 */
                autoComplete='off'
                onCompositionStart={handleCompositionStart}
                onCompositionUpdate={handleCompositionUpdate}
                onCompositionEnd={handleCompositionEnd}
                onKeyDown={handleKeyDown}
                onSelect={handleSelect}
                {...props}
            />
            {(openWhenEmpty || value.length >= requiredCharacters) &&
            state.presentationType === 'text' &&

            SuggestionListComponent &&

                // <div style={{width: state.width}}>
                <div>
                    <SuggestionListComponent
                        ariaLiveRef={suggestionReadOut}
                        open={state.focused || forceSuggestionsWhenBlur}
                        pretext={pretext}
                        position={getListPosition(listPosition)}

                        // set either the value stored in the renderDividers prop or an empty array
                        renderDividers={(state.allowDividers) ? renderDividers : []}
                        renderNoResults={renderNoResults}
                        onCompleteWord={handleCompleteWord}
                        preventClose={preventSuggestionListClose}
                        onItemHover={setSelection}
                        cleared={state.cleared}
                        matchedPretext={state.matchedPretext}
                        items={state.items}
                        terms={state.terms}

                        // suggestionBoxAlgn={state.suggestionBoxAlgn}
                        selection={state.selection}
                        components={state.components}
                        inputRef={inputRef}

                        // onLoseVisibility={blur}
                    />
                </div>
            }
            {(openWhenEmpty || value.length >= requiredCharacters) &&
            state.presentationType === 'date' &&
            SuggestionDateComponent &&
                <SuggestionDateComponent
                    items={state.items}
                    terms={state.terms}
                    components={state.components}
                    matchedPretext={state.matchedPretext}
                    onCompleteWord={handleCompleteWord}
                />
            }
        </div>
    );
};

// export default class SuggestionBox extends React.PureComponent<SuggestionBoxProps> {

//     render() {
//         // Don't pass props used by SuggestionBox
//         Reflect.deleteProperty(props, 'providers');
//         Reflect.deleteProperty(props, 'onChange'); // We use onInput instead of onChange on the actual input
//         Reflect.deleteProperty(props, 'onComposition');
//         Reflect.deleteProperty(props, 'onItemSelected');
//         Reflect.deleteProperty(props, 'completeOnTab');
//         Reflect.deleteProperty(props, 'isRHS');
//         Reflect.deleteProperty(props, 'requiredCharacters');
//         Reflect.deleteProperty(props, 'openOnFocus');
//         Reflect.deleteProperty(props, 'openWhenEmpty');
//         Reflect.deleteProperty(props, 'onFocus');
//         Reflect.deleteProperty(props, 'onBlur');
//         Reflect.deleteProperty(props, 'containerClass');
//         Reflect.deleteProperty(props, 'replaceAllInputOnSelect');
//         Reflect.deleteProperty(props, 'renderDividers');
//         Reflect.deleteProperty(props, 'contextId');
//         Reflect.deleteProperty(props, 'listenForMentionKeyClick');
//         Reflect.deleteProperty(props, 'forceSuggestionsWhenBlur');
//         Reflect.deleteProperty(props, 'onSuggestionsReceived');
//         Reflect.deleteProperty(props, 'actions');
//         Reflect.deleteProperty(props, 'shouldSearchCompleteText');
//     }
// }

const SuggestionBox = React.forwardRef(SuggestionBoxComponent);

export {
    SuggestionBox,
};
