// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {QuickInputState} from '../../quick_input';

import * as UserAgent from 'utils/user_agent';

import {ISuggestionBoxProps, ISuggestionBoxState} from './types';
import {SuggestionHandler} from './use_suggestion_handler';

export const useContainerRef = (
    inputRef: React.MutableRefObject<any>,
    preventSuggestionListCloseFlag: React.MutableRefObject<boolean>,
    pretextRef: React.MutableRefObject<string>,
    qInputState: QuickInputState,
    suggestionBoxProps: ISuggestionBoxProps,
    updateSuggestionBoxStateFn: (newState: Partial<ISuggestionBoxState>) => void,
    suggestionHandler: React.MutableRefObject<SuggestionHandler>,
) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleFocusIn = React.useCallback((e: FocusEvent) => {
        if (containerRef.current?.contains(e.relatedTarget as Node | null) ||
            preventSuggestionListCloseFlag.current
        ) {
            return;
        }

        updateSuggestionBoxStateFn({focused: true});
        const {openOnFocus, openWhenEmpty, requiredCharacters, onFocus} = suggestionBoxProps;
        const {handlePretextChanged} = suggestionHandler.current;

        if (openOnFocus || openWhenEmpty) {
            setTimeout(() => {
                const pretext = qInputState.
                    getValue().
                    substring(0, qInputState.getSelection().selectionEnd || undefined);
                if (openWhenEmpty || pretext.length >= (requiredCharacters || 1)) {
                    if (pretextRef.current !== pretext) {
                        handlePretextChanged(pretext);
                    }
                }
            });
        }

        if (onFocus) {
            onFocus();
        }
    }, [
        qInputState,
        suggestionBoxProps.openOnFocus, suggestionBoxProps.openWhenEmpty,
        suggestionBoxProps.requiredCharacters, suggestionBoxProps.onFocus,
    ]);

    const handleFocusOut = React.useCallback((e: FocusEvent) => {
        if (preventSuggestionListCloseFlag.current) {
            preventSuggestionListCloseFlag.current = false;
            return;
        }

        // Focus is switching TO e.relatedTarget, so only treat this as a blur event if we're not switching
        // between children (like from the textbox to the suggestion list)
        if (containerRef.current?.contains(e.relatedTarget as Node | null)) {
            return;
        }

        if (UserAgent.isIos() && !e.relatedTarget) {
            // On Safari and iOS classic app, the autocomplete stays open
            // when you tap outside of the post textbox or search box.
            return;
        }

        const {forceSuggestionsWhenBlur, onBlur} = suggestionBoxProps;
        const {handleEmitClearSuggestions} = suggestionHandler.current;
        if (forceSuggestionsWhenBlur) {
            handleEmitClearSuggestions();
        }

        updateSuggestionBoxStateFn({focused: false});

        if (onBlur) {
            onBlur();
        }
    }, [
        suggestionBoxProps.onBlur, suggestionBoxProps.forceSuggestionsWhenBlur,
    ]);

    React.useEffect(() => {
        if (containerRef.current) {
            containerRef.current.removeEventListener('focusin', handleFocusIn);
            containerRef.current.removeEventListener('focusout', handleFocusOut);
        }

        if (containerRef.current) {
            containerRef.current.addEventListener('focusin', handleFocusIn);
            containerRef.current.addEventListener('focusout', handleFocusOut);
        }
    }, [handleFocusOut, handleFocusIn]);
    return containerRef;
};
