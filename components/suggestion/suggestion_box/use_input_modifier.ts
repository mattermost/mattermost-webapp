// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {useCallback} from 'react';

import {QuickInputState} from '../../quick_input';
import {findOverlap} from 'utils/utils';

import {ISuggestionBoxProps, IInputModifier} from './types';

export const useInputModifier = (
    suggestionBoxProps: ISuggestionBoxProps,
): IInputModifier => {
    const addTextAtCaret = useCallback((qInputState:QuickInputState, term: string, matchedPretext: string) => {
        const {value, onChange} = suggestionBoxProps;

        const caret = qInputState.getSelection().selectionEnd;
        const pretext = qInputState.getValue().substring(0, caret || undefined);

        let prefix;
        let keepPretext = false;
        if (pretext.toLowerCase().endsWith(matchedPretext.toLowerCase())) {
            prefix = pretext.substring(0, pretext.length - matchedPretext.length);
        } else {
            // the pretext has changed since we got a term to complete so see if the term still fits the pretext
            const termWithoutMatched = term.substring(matchedPretext.length);
            const overlap = findOverlap(pretext, termWithoutMatched);

            keepPretext = overlap.length === 0;
            prefix = pretext.substring(0, pretext.length - overlap.length - matchedPretext.length);
        }

        const suffix = value.substring(caret || 0);

        let newValue;
        if (keepPretext) {
            newValue = pretext;
        } else {
            newValue = prefix + term + ' ' + suffix;
        }

        const caretNewPos = prefix.length + term.length + 1;

        if (onChange) {
            // fake an input event to send back to parent components
            const e = {
                target: {
                    value: newValue,
                },
            };

            // don't call handleChange or we'll get into an event loop
            //this is for old api, plan to remove this in the future
            onChange(e as unknown as React.ChangeEvent);
        }

        return QuickInputState.replace(qInputState, {
            value: newValue,
            selectionStart: caretNewPos,
            selectionEnd: caretNewPos,
        });
    }, [suggestionBoxProps.onChange, suggestionBoxProps.value]);

    const replaceText = useCallback((qInputState: QuickInputState, term: string) => {
        return QuickInputState.replace(qInputState, {
            value: term,
            selectionStart: term.length,
            selectionEnd: term.length + 1,
        });
    }, []);

    return {
        replaceText, addTextAtCaret,
    };
};
