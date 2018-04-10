// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import assert from 'assert';

import {ActionTypes} from 'utils/constants.jsx';
import SuggestionStore from 'stores/suggestion_store.jsx';

describe('stores/SuggestionStore', () => {
    test('should ignore events from unknown suggestion boxes', () => {
        const id = 'unknown';
        const pretext = 'pretext';
        SuggestionStore.handleEventPayload({
            action: {
                id,
                type: ActionTypes.SUGGESTION_PRETEXT_CHANGED,
                pretext,
            },
        });
        assert.equal(SuggestionStore.suggestions.has(id), false);
    });

    test('should process events from registered suggestion boxes', () => {
        const id = 'id1';
        const pretext = 'pretext';
        SuggestionStore.registerSuggestionBox(id);
        SuggestionStore.handleEventPayload({
            action: {
                id,
                type: ActionTypes.SUGGESTION_PRETEXT_CHANGED,
                pretext,
            },
        });
        assert.equal(SuggestionStore.suggestions.get(id).pretext, pretext);
    });

    test('should ignore events from unregistered suggestion boxes', () => {
        const id = 'id1';
        const pretext = 'pretext';
        SuggestionStore.registerSuggestionBox(id);
        SuggestionStore.unregisterSuggestionBox(id);

        SuggestionStore.handleEventPayload({
            action: {
                id,
                type: ActionTypes.SUGGESTION_PRETEXT_CHANGED,
                pretext,
            },
        });
        assert.equal(SuggestionStore.suggestions.has(id), false);
    });
});
