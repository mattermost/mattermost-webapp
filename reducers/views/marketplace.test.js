// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import marketplaceReducer from 'reducers/views/marketplace';
import {ActionTypes, ModalIdentifiers} from 'utils/constants';

describe('marketplace', () => {
    test('initial state', () => {
        const currentState = {};
        const action = {};
        const expectedState = {
            plugins: [],
            installing: {},
            errors: {},
            filter: '',
        };

        expect(marketplaceReducer(currentState, action)).toEqual(expectedState);
    });

    test(ActionTypes.RECEIVED_MARKETPLACE_PLUGINS, () => {
        const currentState = {
            plugins: [],
            installing: {},
            errors: {},
            filter: '',
        };
        const action = {
            type: ActionTypes.RECEIVED_MARKETPLACE_PLUGINS,
            plugins: [{id: 'plugin1'}, {id: 'plugin2'}],
        };
        const expectedState = {
            plugins: [{id: 'plugin1'}, {id: 'plugin2'}],
            installing: {},
            errors: {},
            filter: '',
        };

        expect(marketplaceReducer(currentState, action)).toEqual(expectedState);
    });

    describe(ActionTypes.INSTALLING_MARKETPLACE_PLUGIN, () => {
        const currentState = {
            plugins: [{id: 'plugin1'}, {id: 'plugin2'}],
            installing: {plugin1: true},
            errors: {plugin3: 'An error occurred'},
            filter: 'existing',
        };

        it('should set installing for not already installing plugin', () => {
            const action = {
                type: ActionTypes.INSTALLING_MARKETPLACE_PLUGIN,
                id: 'plugin2',
            };
            const expectedState = {
                plugins: [{id: 'plugin1'}, {id: 'plugin2'}],
                installing: {plugin1: true, plugin2: true},
                errors: {plugin3: 'An error occurred'},
                filter: 'existing',
            };

            expect(marketplaceReducer(currentState, action)).toEqual(expectedState);
        });

        it('should no-op for already installing plugin', () => {
            const action = {
                type: ActionTypes.INSTALLING_MARKETPLACE_PLUGIN,
                id: 'plugin1',
            };
            const expectedState = currentState;

            expect(marketplaceReducer(currentState, action)).toBe(expectedState);
        });

        it('should clear error for previously failed plugin', () => {
            const action = {
                type: ActionTypes.INSTALLING_MARKETPLACE_PLUGIN,
                id: 'plugin3',
            };
            const expectedState = {
                plugins: [{id: 'plugin1'}, {id: 'plugin2'}],
                installing: {plugin1: true, plugin3: true},
                errors: {},
                filter: 'existing',
            };

            expect(marketplaceReducer(currentState, action)).toEqual(expectedState);
        });
    });

    describe(ActionTypes.INSTALLING_MARKETPLACE_PLUGIN_SUCCEEDED, () => {
        const currentState = {
            plugins: [{id: 'plugin1'}, {id: 'plugin2'}],
            installing: {plugin1: true, plugin2: true},
            errors: {plugin3: 'An error occurred'},
            filter: 'existing',
        };

        it('should clear installing', () => {
            const action = {
                type: ActionTypes.INSTALLING_MARKETPLACE_PLUGIN_SUCCEEDED,
                id: 'plugin1',
            };
            const expectedState = {
                plugins: [{id: 'plugin1'}, {id: 'plugin2'}],
                installing: {plugin2: true},
                errors: {plugin3: 'An error occurred'},
                filter: 'existing',
            };

            expect(marketplaceReducer(currentState, action)).toEqual(expectedState);
        });

        it('should clear error', () => {
            const action = {
                type: ActionTypes.INSTALLING_MARKETPLACE_PLUGIN_SUCCEEDED,
                id: 'plugin3',
            };
            const expectedState = {
                plugins: [{id: 'plugin1'}, {id: 'plugin2'}],
                installing: {plugin1: true, plugin2: true},
                errors: {},
                filter: 'existing',
            };

            expect(marketplaceReducer(currentState, action)).toEqual(expectedState);
        });
    });

    describe(ActionTypes.INSTALLING_MARKETPLACE_PLUGIN_FAILED, () => {
        const currentState = {
            plugins: [{id: 'plugin1'}, {id: 'plugin2'}],
            installing: {plugin1: true, plugin2: true},
            errors: {plugin3: 'An error occurred'},
            filter: 'existing',
        };

        it('should clear installing and set error', () => {
            const action = {
                type: ActionTypes.INSTALLING_MARKETPLACE_PLUGIN_FAILED,
                id: 'plugin1',
                error: 'Failed to intall',
            };
            const expectedState = {
                plugins: [{id: 'plugin1'}, {id: 'plugin2'}],
                installing: {plugin2: true},
                errors: {plugin1: 'Failed to intall', plugin3: 'An error occurred'},
                filter: 'existing',
            };

            expect(marketplaceReducer(currentState, action)).toEqual(expectedState);
        });
    });

    describe(ActionTypes.FILTER_MARKETPLACE_PLUGINS, () => {
        const currentState = {
            plugins: [{id: 'plugin1'}, {id: 'plugin2'}],
            installing: {plugin1: true, plugin2: true},
            errors: {plugin3: 'An error occurred'},
            filter: 'existing',
        };

        it('should set filter', () => {
            const action = {
                type: ActionTypes.FILTER_MARKETPLACE_PLUGINS,
                filter: 'new',
            };
            const expectedState = {
                plugins: [{id: 'plugin1'}, {id: 'plugin2'}],
                installing: {plugin1: true, plugin2: true},
                errors: {plugin3: 'An error occurred'},
                filter: 'new',
            };

            expect(marketplaceReducer(currentState, action)).toEqual(expectedState);
        });
    });

    describe(ActionTypes.MODAL_CLOSE, () => {
        const currentState = {
            plugins: [{id: 'plugin1'}, {id: 'plugin2'}],
            installing: {plugin1: true, plugin2: true},
            errors: {plugin3: 'An error occurred'},
            filter: 'existing',
        };

        it('should no-op for different modal', () => {
            const action = {
                type: ActionTypes.MODAL_CLOSE,
                modalId: ModalIdentifiers.DELETE_CHANNEL,
            };
            const expectedState = currentState;

            expect(marketplaceReducer(currentState, action)).toBe(expectedState);
        });

        it('should clear state for marketplace modal', () => {
            const action = {
                type: ActionTypes.MODAL_CLOSE,
                modalId: ModalIdentifiers.PLUGIN_MARKETPLACE,
            };
            const expectedState = {
                plugins: [],
                installing: {},
                errors: {},
                filter: '',
            };

            expect(marketplaceReducer(currentState, action)).toEqual(expectedState);
        });
    });
});
