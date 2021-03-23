// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import reducer from 'mattermost-redux/reducers/entities/general';
import {GeneralTypes} from 'mattermost-redux/action_types';

describe('reducers.entities.general', () => {
    describe('firstAdminVisitMarketplaceStatus', () => {
        it('initial state', () => {
            const state = {};
            const action = {};
            const expectedState = {};

            const actualState = reducer({firstAdminVisitMarketplaceStatus: state}, action);
            assert.deepStrictEqual(actualState.firstAdminVisitMarketplaceStatus, expectedState);
        });

        it('RECEIVED_FIRST_ADMIN_VISIT_MARKETPLACE_STATUS, empty initial state', () => {
            const state = {};
            const action = {
                type: GeneralTypes.RECEIVED_FIRST_ADMIN_VISIT_MARKETPLACE_STATUS,
                data: true,
            };
            const expectedState = true;

            const actualState = reducer({firstAdminVisitMarketplaceStatus: state}, action);
            assert.deepStrictEqual(actualState.firstAdminVisitMarketplaceStatus, expectedState);
        });

        it('RECEIVED_FIRST_ADMIN_VISIT_MARKETPLACE_STATUS, previously populated state', () => {
            const state = true;
            const action = {
                type: GeneralTypes.RECEIVED_FIRST_ADMIN_VISIT_MARKETPLACE_STATUS,
                data: true,
            };
            const expectedState = true;

            const actualState = reducer({firstAdminVisitMarketplaceStatus: state}, action);
            assert.deepStrictEqual(actualState.firstAdminVisitMarketplaceStatus, expectedState);
        });
    });
});
