// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import localForage from 'localforage';
import {combineReducers} from 'redux';
import {createMigrate, MigrationManifest, PersistedState, persistReducer, REHYDRATE} from 'redux-persist';

import {General} from 'mattermost-redux/constants';

import {UserTypes} from 'mattermost-redux/action_types';
import type {GenericAction} from 'mattermost-redux/types/actions';

import {StoragePrefixes, StorageTypes} from 'utils/constants';
import {getDraftInfoFromKey} from 'utils/utils';

type StorageEntry = {
    timestamp: Date;
    data: any;
}

function storage(state: Record<string, any> = {}, action: GenericAction) {
    switch (action.type) {
    case REHYDRATE: {
        if (!action.payload || action.key !== 'storage') {
            return state;
        }

        // We have to do some transformation here to correct for the transformation we do when persisting storage state
        const nextState = {...state};

        for (const [key, value] of Object.entries(action.payload)) {
            const nextValue = {...value as StorageEntry};
            if (nextValue.timestamp && typeof nextValue.timestamp === 'string') {
                nextValue.timestamp = new Date(nextValue.timestamp);
            }
            nextState[key] = nextValue;
        }

        return nextState;
    }
    case StorageTypes.SET_ITEM: {
        if (!state[action.data.prefix + action.data.name] ||
            !state[action.data.prefix + action.data.name].timestamp ||
            state[action.data.prefix + action.data.name].timestamp < action.data.timestamp
        ) {
            const nextState = {...state};
            nextState[action.data.prefix + action.data.name] = {
                timestamp: action.data.timestamp,
                value: action.data.value,
            };
            return nextState;
        }
        return state;
    }
    case StorageTypes.REMOVE_ITEM: {
        const nextState = {...state};
        Reflect.deleteProperty(nextState, action.data.prefix + action.data.name);
        return nextState;
    }
    case StorageTypes.SET_GLOBAL_ITEM: {
        if (!state[action.data.name] ||
            !state[action.data.name].timestamp ||
            state[action.data.name].timestamp < action.data.timestamp
        ) {
            const nextState = {...state};
            nextState[action.data.name] = {
                timestamp: action.data.timestamp,
                value: action.data.value,
            };
            return nextState;
        }
        return state;
    }
    case StorageTypes.REMOVE_GLOBAL_ITEM: {
        const nextState = {...state};
        Reflect.deleteProperty(nextState, action.data.name);
        return nextState;
    }
    case StorageTypes.ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX: {
        const nextState = {...state};
        let changed = false;

        for (const key of Object.keys(nextState)) {
            if (!key.startsWith(action.data.prefix)) {
                continue;
            }

            const value = nextState[key].value;
            const nextValue = action.data.action(key, value);
            if (value === nextValue) {
                continue;
            }

            nextState[key] = {
                timestamp: new Date(),
                value: action.data.action(key, state[key].value),
            };
            changed = true;
        }

        return changed ? nextState : state;
    }
    case StorageTypes.STORAGE_REHYDRATE: {
        return {...state, ...action.data};
    }

    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function migrateDrafts(state: any) {
    const drafts: any = {};
    for (const k in state) {
        if (k.startsWith('draft')) {
            const obj = state[k];

            // If draft does not have a channelId, it is a legacy draft and needs to be migrated
            if (!obj.value?.channelId) {
                const info = getDraftInfoFromKey(k, StoragePrefixes.DRAFT);
                const timestamp = new Date(obj.timestamp);

                if (info === null || !info.id) {
                    drafts[k] = {timestamp, value: {message: '', fileInfos: [], uploadsInProgress: []}};
                    continue;
                }
                const migratedDraft = {
                    timestamp,
                    value: {
                        message: obj.value?.message,
                        fileInfos: obj.value?.fileInfos || [],
                        props: obj.value?.props || {},
                        uploadsInProgress: obj.value?.uploadsInProgress || [],
                        channelId: info.id,
                        rootId: '',
                        createAt: timestamp.getTime(),
                        updateAt: timestamp.getTime(),
                        show: true,
                        remote: false,
                    },
                };

                drafts[k] = {...migratedDraft};
            }
        }
    }

    return {
        ...state,
        ...drafts,
    };
}

function initialized(state = false, action: GenericAction) {
    switch (action.type) {
    case General.STORE_REHYDRATION_COMPLETE:
        return state || action.complete;

    default:
        return state;
    }
}

const migrations: MigrationManifest = {
    1: (state: PersistedState): PersistedState => {
        return {
            ...migrateDrafts(state),
        };
    },
};

const config = {
    key: 'storage',
    version: 1,
    storage: localForage,
    migrate: createMigrate(migrations, {debug: false}),
};

export default combineReducers({
    storage: persistReducer(config, storage),
    initialized,
});
