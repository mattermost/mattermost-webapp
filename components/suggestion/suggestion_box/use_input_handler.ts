// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {QuickInputState} from '../../quick_input';

import Constants from 'utils/constants';

import * as Utils from 'utils/utils';

import {
    ISuggestionBoxProps,
    IRefHandler, ISuggestionBoxState,
} from './types';
import {SuggestionHandler} from './use_suggestion_handler';

const KeyCodes = Constants.KeyCodes;

export const useInputHandler = (
    composingFlag: React.MutableRefObject<boolean>,
    pretextRef: React.MutableRefObject<string>,
    timeoutIdRef: React.MutableRefObject<NodeJS.Timeout | undefined>,
    suggestionBoxProps: ISuggestionBoxProps,
    suggestionBoxState: ISuggestionBoxState,
    onQInputStateChanged: React.Dispatch<React.SetStateAction<QuickInputState> >,
    updateSuggestionBoxStateFn: (newState: Partial<ISuggestionBoxState>) => void,
    suggestionHandler: React.MutableRefObject<SuggestionHandler>,
    qInputRefHandler: IRefHandler,

) => {
    //new API
    const handleTextboxChange = React.useCallback((qInputState: QuickInputState) => {
        onQInputStateChanged(qInputState);
    }, []);

    const handleTextboxCompositionUpdate = React.useCallback(
        (qInputState: QuickInputState, composingData: string | null | undefined) => {
            if (!composingData) {
                return;
            }
            const pretext = qInputState.
                getValue().
                substring(
                    0, qInputState.getSelection().selectionStart || undefined,
                ).concat(composingData);

            suggestionHandler.current.handlePretextChanged(pretext);

            const {onComposition} = suggestionBoxProps;
            if (onComposition) {
                onComposition();
            }
        }, [suggestionBoxProps.onComposition],
    );

    //old API
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | any>) => {
        const pretext = e.target.value.substring(0, e.target.selectionEnd).toLowerCase();

        if (!composingFlag.current && pretextRef.current !== pretext) {
            suggestionHandler.current.handlePretextChanged(pretext);
        }
        const {onChange} = suggestionBoxProps;
        if (onChange) {
            onChange(e);
        }
    }, [suggestionBoxProps.onChange]);

    const handleCompositionStart = React.useCallback(() => {
        composingFlag.current = true;
        const {onComposition} = suggestionBoxProps;
        if (onComposition) {
            onComposition();
        }
    }, [suggestionBoxProps.onComposition, pretextRef, composingFlag]);

    const handleCompositionUpdate = React.useCallback((e: React.CompositionEvent) => {
        if (!e.data) {
            return;
        }

        // The caret appears before the CJK character currently being composed, so re-add it to the pretext
        const textbox = qInputRefHandler.getTextbox();
        const pretext = textbox.value.substring(0, textbox.selectionStart || undefined) + e.data;

        suggestionHandler.current.handlePretextChanged(pretext);
        const {onComposition} = suggestionBoxProps;
        if (onComposition) {
            onComposition();
        }
    }, [suggestionBoxProps.onComposition, qInputRefHandler]);

    const handleCompositionEnd = React.useCallback(() => {
        composingFlag.current = false;
        const {onComposition} = suggestionBoxProps;
        if (onComposition) {
            onComposition();
        }
    }, [suggestionBoxProps.onComposition]);

    const handleSelect = React.useCallback((e) => {
        const {onSelect} = suggestionBoxProps;
        if (onSelect) {
            onSelect(e);
        }
    }, [suggestionBoxProps.onSelect]);

    const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
        const {openWhenEmpty, value, completeOnTab, onKeyDown} = suggestionBoxProps;
        const {terms, selection, matchedPretext: curMatchedPretexts} = suggestionBoxState;
        const {
            hasSuggestions, selectPrevious, selectNext, handleCompleteWord,
            nonDebouncedPretextChanged, clear,
        } = suggestionHandler.current;
        if ((openWhenEmpty || value) && hasSuggestions()) {
            if (Utils.isKeyPressed(e, KeyCodes.UP)) {
                selectPrevious();
                e.preventDefault();
            } else if (Utils.isKeyPressed(e, KeyCodes.DOWN)) {
                selectNext();
                e.preventDefault();
            } else if (Utils.isKeyPressed(e, KeyCodes.ENTER) || (completeOnTab && Utils.isKeyPressed(e, KeyCodes.TAB))) {
                let matchedPretext = '';
                for (let i = 0; i < terms.length; i++) {
                    if (terms[i] === selection) {
                        matchedPretext = curMatchedPretexts[i];
                    }
                }

                // If these don't match, the user typed quickly and pressed enter before we could
                // update the pretext, so update the pretext before completing
                if (pretextRef.current.toLowerCase().endsWith(matchedPretext.toLowerCase())) {
                    if (handleCompleteWord(selection, matchedPretext, e)) {
                        return;
                    }
                } else {
                    if (timeoutIdRef.current) {
                        clearTimeout(timeoutIdRef.current);
                    }
                    nonDebouncedPretextChanged(pretextRef.current, true);
                }

                if (onKeyDown) {
                    onKeyDown(e as unknown as React.KeyboardEvent);
                }
                e.preventDefault();
            } else if (Utils.isKeyPressed(e, KeyCodes.ESCAPE)) {
                clear();
                updateSuggestionBoxStateFn({presentationType: 'text'});
                e.preventDefault();
                e.stopPropagation();
            } else if (onKeyDown) {
                onKeyDown(e as unknown as React.KeyboardEvent);
            }
        } else if (onKeyDown) {
            onKeyDown(e as unknown as React.KeyboardEvent);
        }
    }, [
        suggestionBoxProps.onKeyDown, suggestionBoxProps.completeOnTab,
        suggestionBoxProps.value, suggestionBoxProps.openWhenEmpty,
        suggestionBoxState.matchedPretext, suggestionBoxState.terms,
        suggestionBoxState.selection,
    ]);

    return {
        handleChange,
        handleCompositionStart,
        handleCompositionUpdate,
        handleCompositionEnd,
        handleSelect,
        handleKeyDown,
        handleTextboxChange,
        handleTextboxCompositionUpdate,
    };
};
