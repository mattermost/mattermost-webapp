// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useMemo} from 'react';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils';
import {EXECUTE_CURRENT_COMMAND_ITEM_ID} from '../command_provider';
import {QuickInputState} from '../../quick_input';
import Provider from '../provider';

import {IInputModifier, IRefHandler, ISuggestionBoxProps, ISuggestionBoxState} from './types';

export const useSuggestionHandler = (
    pretextRef: React.MutableRefObject<string>,
    timeoutIdRef: React.MutableRefObject<NodeJS.Timeout | undefined>,
    suggestionBoxProps: ISuggestionBoxProps,
    suggestionBoxState: ISuggestionBoxState,
    updateSuggestionBoxState: (newState: Partial<ISuggestionBoxState>) => void,
    setQInputStateFn: React.Dispatch<React.SetStateAction<QuickInputState> >,
    qInputModifier: IInputModifier,
    qInputRefHandler: IRefHandler,
) => {
    const suggestionHandler = useMemo(
        () => new SuggestionHandler(
            pretextRef, timeoutIdRef, suggestionBoxProps, suggestionBoxState,
            updateSuggestionBoxState,
            setQInputStateFn, qInputModifier, qInputRefHandler,
        ),
        [
            suggestionBoxState.selection, suggestionBoxState.items, suggestionBoxState.terms,
            suggestionBoxProps.providers, suggestionBoxProps.onSuggestionsReceived,
            suggestionBoxProps.replaceAllInputOnSelect,
            suggestionBoxProps.onItemSelected,
            suggestionBoxProps.onKeyPress,
            qInputModifier, qInputRefHandler,
        ],
    );
    const suggestionHandlerRef = React.useRef<SuggestionHandler>(suggestionHandler);
    React.useEffect(() => {
        suggestionHandlerRef.current = suggestionHandler;
    }, [suggestionHandler]);
    return suggestionHandlerRef;
};

export class SuggestionHandler {
    constructor(
        private pretextRef: React.MutableRefObject<string>,
        private timeoutIdRef: React.MutableRefObject<NodeJS.Timeout | undefined>,
        private suggestionBoxProps: ISuggestionBoxProps,
        private suggestionBoxState: ISuggestionBoxState,
        private updateSuggestionBoxState: (newState: Partial<ISuggestionBoxState>) => void,
        private setQInputStateFn: React.Dispatch<React.SetStateAction<QuickInputState> >,
        private qInputModifier: IInputModifier,
        private qInputRefHandler: IRefHandler,
    ) {
        this.clear = this.clear.bind(this);
        this.handlePretextChanged = this.handlePretextChanged.bind(this);
        this.handleEmitClearSuggestions = this.handleEmitClearSuggestions.bind(this);
        this.debouncedPretextChanged = this.debouncedPretextChanged.bind(this);
        this.nonDebouncedPretextChanged = this.nonDebouncedPretextChanged.bind(this);
        this.handleReceivedSuggestions = this.handleReceivedSuggestions.bind(this);
        this.handleReceivedSuggestionsAndComplete = this.
            handleReceivedSuggestionsAndComplete.bind(this);
        this.handleCompleteWord = this.handleCompleteWord.bind(this);
        this.setSelection = this.setSelection.bind(this);
        this.selectNext = this.selectNext.bind(this);
        this.selectPrevious = this.selectPrevious.bind(this);
        this.hasSuggestions = this.hasSuggestions.bind(this);
    }
    clear() {
        this.updateSuggestionBoxState({
            matchedPretext: [],
            terms: [],
            items: [],
            components: [],
            selection: '',
        });
        this.pretextRef.current = '';
        if (this.timeoutIdRef.current) {
            clearTimeout(this.timeoutIdRef.current);
        }
    }
    handleEmitClearSuggestions(delay = 0) {
        setTimeout(() => {
            this.clear();
        }, delay);
    }
    handlePretextChanged(pretext: string) {
        this.pretextRef.current = pretext;
        this.debouncedPretextChanged(pretext);
    }
    debouncedPretextChanged(pretext: string) {
        if (this.timeoutIdRef.current) {
            clearTimeout(this.timeoutIdRef.current);
        }
        this.timeoutIdRef.current = setTimeout(() => {
            this.nonDebouncedPretextChanged(pretext);
        }, Constants.SEARCH_TIMEOUT_MILLISECONDS);
    }
    nonDebouncedPretextChanged(pretext: string, complete = false) {
        this.pretextRef.current = pretext;
        let handled = false;
        let callback: (...args: any[]) => any = this.handleReceivedSuggestions;
        if (complete) {
            callback = this.handleReceivedSuggestionsAndComplete;
        }
        const {providers} = this.suggestionBoxProps;
        for (const provider of providers) {
            handled = provider.handlePretextChanged(pretext, callback) as unknown as boolean ||
                handled;

            if (handled) {
                this.updateSuggestionBoxState({
                    presentationType: provider.presentationType(),
                    allowDividers: provider.allowDividers(),
                });

                break;
            }
        }
        if (!handled) {
            this.clear();
        }
    }
    handleReceivedSuggestions(suggestions: any) {
        const newComponents: any[] = [];
        const newPretext: any[] = [];
        const {onSuggestionsReceived} = this.suggestionBoxProps;
        if (onSuggestionsReceived) {
            onSuggestionsReceived(suggestions);
        }
        for (let i = 0; i < suggestions.terms.length; i++) {
            newComponents.push(suggestions.component);
            newPretext.push(suggestions.matchedPretext);
        }
        const terms = suggestions.terms;
        const items = suggestions.items;

        const {selection: sBoxStateSelection} = this.suggestionBoxState;
        let selection = sBoxStateSelection;
        if (terms.length > 0) {
            // if the current selection is no longer in the map, select the first term in the list
            if (!selection || terms.indexOf(selection) === -1) {
                selection = terms[0];
            }
        } else if (sBoxStateSelection) {
            selection = '';
        }
        this.updateSuggestionBoxState({
            selection,
            terms,
            items,
            components: newComponents,
            matchedPretext: newPretext,
        });
        return {selection, matchedPretext: suggestions.matchedPretext};
    }
    handleCompleteWord(term: string, matchedPretext: string, e?: KeyboardEvent) {
        const {replaceText, addTextAtCaret} = this.qInputModifier;
        const {
            replaceAllInputOnSelect, onItemSelected, onKeyPress, providers,
        } = this.suggestionBoxProps;
        let fixedTerm = term;
        let finish = false;
        if (term.endsWith(EXECUTE_CURRENT_COMMAND_ITEM_ID)) {
            fixedTerm = term.substring(0, term.length - EXECUTE_CURRENT_COMMAND_ITEM_ID.length);
            finish = true;
        }
        if (replaceAllInputOnSelect) {
            this.setQInputStateFn((prevQInputState) => replaceText(prevQInputState, fixedTerm));
        } else {
            this.setQInputStateFn(
                (prevState) => addTextAtCaret(prevState, fixedTerm, matchedPretext),
            );
        }
        if (onItemSelected) {
            const {items, terms} = this.suggestionBoxState;
            for (let i = 0; i < terms.length; i++) {
                if (terms[i] === fixedTerm) {
                    onItemSelected(items[i]);
                    break;
                }
            }
        }
        this.clear();
        this.qInputRefHandler.focus();

        if (finish && onKeyPress) {
            let ke: KeyboardEvent | undefined = e;
            if (!e || Utils.isKeyPressed(e, Constants.KeyCodes.TAB)) {
                ke = new KeyboardEvent('keydown', {
                    bubbles: true,
                    cancelable: true,
                    key: 'Enter',
                });
                if (e) {
                    e.preventDefault();
                }
            }
            if (ke) {
                onKeyPress(ke as unknown as React.KeyboardEvent);
            }
            return true;
        }

        if (!finish) {
            for (const provider of providers) {
                if (checkHandleCompleteWordInProvider(provider)) {
                    provider.handleCompleteWord(fixedTerm, matchedPretext, this.handlePretextChanged);
                }
            }
        }
        return false;
    }
    handleReceivedSuggestionsAndComplete(suggestions: any) {
        const {selection, matchedPretext} = this.handleReceivedSuggestions(suggestions);
        if (selection) {
            this.handleCompleteWord(selection, matchedPretext);
        }
    }

    setSelection(term: string) {
        this.updateSuggestionBoxState({
            selection: term,
        });
    }

    setSelectionByDelta(delta: number) {
        const {terms, selection} = this.suggestionBoxState;
        let selectionIndex = terms.indexOf(selection);
        if (selectionIndex === -1) {
            this.updateSuggestionBoxState({
                selection: '',
            });
            return;
        }
        selectionIndex += delta;

        if (selectionIndex < 0) {
            selectionIndex = 0;
        } else if (selectionIndex > terms.length - 1) {
            selectionIndex = terms.length - 1;
        }

        this.updateSuggestionBoxState({
            selection: terms[selectionIndex],
        });
    }
    selectNext() {
        this.setSelectionByDelta(1);
    }
    selectPrevious() {
        this.setSelectionByDelta(-1);
    }

    hasSuggestions() {
        return this.suggestionBoxState.items.some((item) => !item.loading);
    }
}

function checkHandleCompleteWordInProvider(
    provider: Provider,
): provider is Provider & {
    handleCompleteWord: (
        term: string, matched: string, callback: (pretext: string) => void
    ) => void;
} {
    return 'handleCompleteWord' in provider;
}
