// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {combineReducers} from 'redux';

import {InsightTypes} from 'mattermost-redux/action_types';
import {GenericAction} from 'mattermost-redux/types/actions';
import {TopReaction, TimeFrame} from 'mattermost-redux/types/insights';

function topReactions(state: Record<string, Record<TimeFrame, Record<string, TopReaction>>> = {}, action: GenericAction) {
    switch (action.type) {
    case InsightTypes.RECEIVED_TOP_REACTIONS: {
        const reactions = {...(state[action.id] || {})};
        const results = action.data.data.items || [];
        const timeFrame = action.data.timeFrame as TimeFrame;

        if (!reactions || !reactions[timeFrame]) {
            reactions[timeFrame] = {};
        }

        const r = {...reactions[timeFrame] || {}};

        for (let i = 0; i < results.length; i++) {
            const emojiObj = results[i];
            r[emojiObj.emoji_name] = emojiObj;
        }

        return {
            ...state,
            [action.id]: {
                ...(state[action.id] || {}),
                [timeFrame]: r,
            },
        };
    }
    default:
        return state;
    }
}

function myTopReactions(state: Record<TimeFrame, Record<string, TopReaction>> = {today: {}, '7_day': {}, '28_day': {}}, action: GenericAction) {
    switch (action.type) {
    case InsightTypes.RECEIVED_MY_TOP_REACTIONS: {
        const timeFrame = action.data.timeFrame as TimeFrame;
        const reactions = {...(state[timeFrame])};
        const results = action.data.data.items || [];

        for (let i = 0; i < results.length; i++) {
            const emojiObj = results[i];
            reactions[emojiObj.emoji_name] = emojiObj;
        }

        return {
            ...state,
            [timeFrame]: {
                ...(state[timeFrame] || {}),
                ...reactions,
            },
        };
    }
    default:
        return state;
    }
}

export default combineReducers({

    // Object where every key is the team id, another nested object where the key is TimeFrame and that TimeFrame key has an object of reactions where the key is the emoji_name
    topReactions,

    myTopReactions,
});
