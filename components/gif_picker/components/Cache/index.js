// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 *  Action types
 */
export const CACHE_GIFS = 'CACHE_GIFS';
export const CACHE_REQUEST = 'CACHE_REQUEST';

/**
 *  Actions
 */
export function cacheRequest() {
    return {
        type: CACHE_REQUEST,
        payload: {
            updating: true,
        }};
}

export function cacheGifs(gifs) {
    return {
        type: CACHE_GIFS,
        gifs,
    };
}

/**
 *  Action Creators
 */
export function cacheGifsRequest(gifs) {
    return (dispatch) => {
        dispatch(cacheRequest());
        dispatch(cacheGifs(gifs));
    };
}

/**
 *  Export all action creators in one object
 */
export const actions = {cacheGifsRequest};

/**
 *  Selectors
 */
const SELECTORS = {
    [CACHE_GIFS]: (state, action) => ({
        ...state,
        gifs: GIF_SELECTOR[action.type](state.gifs, action),
        updating: false,
    }),
    [CACHE_REQUEST]: (state, action) => ({
        ...state,
        ...action.payload,
    }),
};

/**
 * Helper selector for gifs.
 * Takes in state.gifs as its state
 */
const GIF_SELECTOR = {
    [CACHE_GIFS]: (state, action) => ({
        ...state,
        ...action.gifs.reduce((map, obj) => {
            map[obj.gfyId] = obj;
            return map;
        }, {}),
    }),
};

/**
 *  Reducers
 */
const initialState = {gifs: {}, updating: false};
export function cacheReducer(state = initialState, action) {
    const selector = SELECTORS[action.type];

    return selector ? selector(state, action) : state;
}
