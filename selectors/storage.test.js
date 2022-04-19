// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {getPrefix} from 'utils/storage_utils';
import * as Selectors from 'selectors/storage';

describe('Selectors.Storage', () => {
    const testState = {
        entities: {
            users: {
                currentUserId: 'user_id',
                profiles: {
                    user_id: {
                        id: 'user_id',
                    },
                },
            },
        },
        storage: {
            storage: {
                'global-item': {value: 'global-item-value', timestamp: new Date()},
                user_id_item: {value: 'item-value', timestamp: new Date()},
            },
        },
    };

    it('getPrefix', () => {
        assert.equal(getPrefix({}), 'unknown_');
        assert.equal(getPrefix({entities: {}}), 'unknown_');
        assert.equal(getPrefix({entities: {users: {currentUserId: 'not-exists'}}}), 'unknown_');
        assert.equal(getPrefix({entities: {users: {currentUserId: 'not-exists', profiles: {}}}}), 'unknown_');
        assert.equal(getPrefix({entities: {users: {currentUserId: 'exists', profiles: {exists: {id: 'user_id'}}}}}), 'user_id_');
    });

    it('makeGetGlobalItem', () => {
        assert.equal(Selectors.makeGetGlobalItem('not-existing-global-item')(testState), null);
        assert.equal(Selectors.makeGetGlobalItem('not-existing-global-item', 'default')(testState), 'default');
        assert.equal(Selectors.makeGetGlobalItem('global-item')(testState), 'global-item-value');
    });

    it('makeGetItem', () => {
        assert.equal(Selectors.makeGetItem('not-existing-item')(testState), null);
        assert.equal(Selectors.makeGetItem('not-existing-item', 'default')(testState), 'default');
        assert.equal(Selectors.makeGetItem('item')(testState), 'item-value');
    });
});
