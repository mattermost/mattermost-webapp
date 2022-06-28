// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import AppCommandProvider from '../command_provider/app_provider';
import AtMentionProvider from '../at_mention_provider';
import ChannelMentionProvider from '../channel_mention_provider';
import CommandProvider from '../command_provider/command_provider';
import EmoticonProvider from '../emoticon_provider';

import Constants from 'utils/constants';

import * as Utils from 'utils/utils';

import {DefaultState, SuggestionBoxProps} from './suggestion_box';

export type InputRef = React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
type SetStateHandler = React.Dispatch<React.SetStateAction<DefaultState>>;

export type ProviderSuggestions = {
    matchedPretext: any;
    terms: string[];
    items: any[];
    component: React.ReactNode;
}

// Finds the longest substring that's at both the end of b and the start of a. For example,
// if a = "firepit" and b = "pitbull", findOverlap would return "pit".
export const findOverlap = (a: string, b: string) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();

    for (let i = bLower.length; i > 0; i--) {
        const substring = bLower.substring(0, i);

        if (aLower.endsWith(substring)) {
            return substring;
        }
    }

    return '';
};

export const getTextbox = (inputRef: InputRef) => {
    if (!inputRef.current) {
        return null;
    }
    return inputRef.current;
};

export const addTextAtCaret = (
    term: string,
    matchedPretext: string,
    value: string,
    inputRef: InputRef,
    onChange?: (value: string) => void,
) => {
    const textbox = getTextbox(inputRef);
    if (!textbox) {
        return;
    }
    const caret = textbox.selectionEnd;
    const tempPretext = textbox.value.substring(0, textbox.selectionEnd || undefined);

    let prefix;
    let keepPretext = false;
    if (tempPretext.toLowerCase().endsWith(matchedPretext.toLowerCase())) {
        prefix = tempPretext.substring(0, tempPretext.length - matchedPretext.length);
    } else {
        // the pretext has changed since we got a term to complete so see if the term still fits the pretext
        const termWithoutMatched = term.substring(matchedPretext.length);
        const overlap = findOverlap(tempPretext, termWithoutMatched);

        keepPretext = overlap.length === 0;
        prefix = tempPretext.substring(0, tempPretext.length - overlap.length - matchedPretext.length);
    }

    const suffix = (caret) ? value.substring(caret) : undefined;

    let newValue: string;
    if (keepPretext) {
        newValue = tempPretext;
    } else {
        newValue = prefix + term + ' ' + suffix;
    }

    textbox.value = newValue;

    if (onChange) {
        onChange(newValue);
    }

    // set the caret position after the next rendering
    window.requestAnimationFrame(() => {
        if (textbox.value === newValue) {
            Utils.setCaretPosition(textbox, prefix.length + term.length + 1);
        }
    });
};

export const replaceText = (
    term: string,
    inputRef: InputRef,
    onChange?: (value: string) => void,
) => {
    const textbox = getTextbox(inputRef);
    if (!textbox) {
        return;
    }
    textbox.value = term;

    if (onChange) {
        onChange(term);
    }
};

export const handleMentionKeyClick = (mentionKey: string, value: string, isRHS: boolean, inputRef: InputRef) => {
    if (!isRHS) {
        return;
    }

    let insertText = '@' + mentionKey;

    // if the current text does not end with a whitespace, then insert a space
    if (value && ((/[^\s]$/)).test(value)) {
        insertText = ' ' + insertText;
    }

    addTextAtCaret(insertText, '', value, inputRef);
};

// this is paired with a useEffect hook to debounce the change.
export const clear = (
    setState: SetStateHandler,
    state: DefaultState,
) => {
    if (!state.cleared) {
        setState((prevState) => ({
            ...prevState,
            cleared: true,
            matchedPretext: [],
            terms: [],
            items: [],
            components: [],
            selection: '',
            suggestionBoxAlgn: undefined,
        }));
    }
};

export const handleReceivedSuggestions = (
    suggestions: ProviderSuggestions,
    setState: SetStateHandler,
    state: DefaultState,
    onSuggestionsReceived?: (suggestions: ProviderSuggestions) => void,
) => {
    const newComponents: DefaultState['components'] = [];
    const newPretext: DefaultState['matchedPretext'] = [];
    if (onSuggestionsReceived) {
        onSuggestionsReceived(suggestions);
    }
    suggestions.terms.forEach(() => {
        newComponents.push(suggestions.component);
        newPretext.push(suggestions.matchedPretext);
    });

    const terms = suggestions.terms;
    const items = suggestions.items;
    let selection = state.selection;
    const selectionIndex = terms.indexOf(selection);
    if (selectionIndex !== state.selectionIndex) {
        if (terms.length > 0) {
            selection = terms[0];
        } else if (state.selection) {
            selection = '';
        }
    }
    setState((prevState) => ({
        ...prevState,
        cleared: false,
        selection,
        items,
        components: newComponents || [suggestions.component],
        matchedPretext: newPretext,
        terms,
    }));

    return {selection, matchedPretext: suggestions.matchedPretext};
};

export const handleReceivedSuggestionsAndComplete = (
    suggestions: ProviderSuggestions,
    setState: SetStateHandler,
    state: DefaultState,
    handleCompleteWord: (term: string, matchedPretext: string) => boolean,
    onSuggestionsReceived?: (suggestions: ProviderSuggestions) => void,
) => {
    const {selection, matchedPretext} = handleReceivedSuggestions(suggestions, setState, state, onSuggestionsReceived);
    if (selection) {
        handleCompleteWord(selection, matchedPretext);
    }
};

export const nonDebouncedPretextChanged = async (
    tempPretext: string,
    complete = false,
    providers: SuggestionBoxProps['providers'] = [],
    state: DefaultState,
    inputRef: InputRef,
    setState: SetStateHandler,

    handleReceivedSuggestions: (suggestions: ProviderSuggestions) => {
        selection: string;
        matchedPretext: any;
    },
    handleReceivedSuggestionsAndComplete: (suggestions: ProviderSuggestions) => void,
) => {
    let handled = false;
    let callback: typeof handleReceivedSuggestions | typeof handleReceivedSuggestionsAndComplete = handleReceivedSuggestions;
    if (complete) {
        callback = handleReceivedSuggestionsAndComplete;
    }
    for (const provider of providers) {
        // eslint-disable-next-line no-await-in-loop
        handled = await provider.handlePretextChanged(
            tempPretext,
            callback) || handled;

        if (handled && (

            // not all providers support triggerCharacter
            provider instanceof CommandProvider ||
            provider instanceof AppCommandProvider ||
            provider instanceof AtMentionProvider ||
            provider instanceof ChannelMentionProvider ||
            provider instanceof EmoticonProvider)
        ) {
            if (!state.suggestionBoxAlgn && ['@', ':', '~', '/'].includes(provider.triggerCharacter)) {
                const char = provider.triggerCharacter;
                const pxToSubstract = Utils.getPxToSubstract(char);

                const fetchedTextBox = getTextbox(inputRef);
                if (fetchedTextBox) {
                // get the alignment for the box and set it in the component state
                    const suggestionBoxAlgn = Utils.getSuggestionBoxAlgn(fetchedTextBox as HTMLTextAreaElement, pxToSubstract);
                    setState((prevState) => ({
                        ...prevState,
                        suggestionBoxAlgn,
                    }));
                }
            }

            setState((prevState) => ({
                ...prevState,
                presentationType: provider.presentationType() as DefaultState['presentationType'],
                allowDividers: provider.allowDividers(),
            }));

            break;
        }
    }

    if (!handled) {
        clear(setState, state);
    }
};

export const debouncedPretextChanged = (
    tempPretext: string,
    timeoutId: NodeJS.Timeout | undefined,
    setTimeoutId: React.Dispatch<React.SetStateAction<NodeJS.Timeout | undefined>>,
    state: DefaultState,
    inputRef: InputRef,
    setState: SetStateHandler,
    handleReceivedSuggestions: (suggestions: ProviderSuggestions) => {
        selection: string;
        matchedPretext: any;
    },
    handleReceivedSuggestionsAndComplete: (suggestions: ProviderSuggestions) => void,
    providers: SuggestionBoxProps['providers'] = [],
): void => {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    setTimeoutId(() => setTimeout(() => nonDebouncedPretextChanged(
        tempPretext,
        false,
        providers,
        state,
        inputRef,
        setState,
        handleReceivedSuggestions,
        handleReceivedSuggestionsAndComplete,
    ), Constants.SEARCH_TIMEOUT_MILLISECONDS));
};

const setSelectionByDelta = (
    delta: number,
    terms: DefaultState['terms'],
    selection: DefaultState['selection'],
    setState: SetStateHandler,
) => {
    let selectionIndex = terms.indexOf(selection);

    if (selectionIndex === -1) {
        setState((prevState) => ({
            ...prevState,
            selection: '',
        }));
        return;
    }

    selectionIndex += delta;

    if (selectionIndex < 0) {
        selectionIndex = 0;
    } else if (selectionIndex > terms.length - 1) {
        selectionIndex = terms.length - 1;
    }

    setState((prevState) => ({
        ...prevState,
        selection: terms[selectionIndex],
        selectionIndex,
    }));
};

export const selectNext = (
    terms: DefaultState['terms'],
    selection: DefaultState['selection'],
    setState: SetStateHandler,
) => setSelectionByDelta(1, terms, selection, setState);

export const selectPrevious = (
    terms: DefaultState['terms'],
    selection: DefaultState['selection'],
    setState: SetStateHandler,
) => setSelectionByDelta(-1, terms, selection, setState);

export const setSelection = (
    term: string,
    terms: DefaultState['terms'],
    selection: DefaultState['selection'],
    setState: SetStateHandler,
) => {
    if (!terms) {
        return;
    }
    const selectionIndex = terms.indexOf(selection);

    setState((prevState) => ({
        ...prevState,
        selection: term,
        selectionIndex,
    }));
};

export const hasSuggestions = (
    items: DefaultState['items'],
) => {
    return items.some((item) => !item.loading);
};

// previously handled the event and passed it up.
// Need to see if doing it from the textbox causes issues here.

export const handleChange = (
    value: string,
    inputRef: InputRef,
    shouldSearchCompleteText: boolean,
    isComposing: boolean,
    pretext: string,
    setPretext: React.Dispatch<React.SetStateAction<string>>,
    onChange?: (value: string) => void,
) => {
    // const textbox = getTextbox(inputRef);

    // if (!textbox) {
    //     return;
    // }

    const foundPretext = shouldSearchCompleteText ? value.trim() : value.substring(0, value.length + 1 || undefined);

    if (!isComposing && pretext !== foundPretext) {
        setPretext(foundPretext);
    }

    if (onChange) {
        onChange(value as string);
    }
};

