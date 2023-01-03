// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {screen} from '@testing-library/react';

import {DeepPartial} from '@mattermost/types/utilities';

import {renderWithIntlAndStore} from 'tests/react_testing_utils';
import {GlobalState} from 'types/store';
import {TestHelper as TH} from 'utils/test_helper';
import * as storageActions from 'actions/storage';

import {STORAGE_KEY_PURCHASE_IN_PROGRESS} from 'components/self_hosted_purchase_modal/constants';

import PurchaseInProgressModal from './';

jest.mock('mattermost-redux/client', () => {
    const original = jest.requireActual('mattermost-redux/client');
    return {
        __esModule: true,
        ...original,
        Client4: {
            ...original,
            bootstrapSelfHostedSignup: jest.fn(),
        },
    };
});

const initialState: DeepPartial<GlobalState> = {
    entities: {
        preferences: {
            myPreferences: {
                theme: {},
            },
        },
        users: {
            currentUserId: 'adminUserId',
            profiles: {
                adminUserId: TH.getUserMock({
                    id: 'adminUserId',
                    roles: 'admin',
                    email: 'admin@example.com',
                }),
                otherUserId: TH.getUserMock({
                    id: 'otherUserId',
                    roles: '',
                    email: 'other-user@example.com',
                }),
            },
        },
    },
};

describe('PurchaseInProgressModal', () => {
    it('when purchaser and user emails are different, user is instructed to wait', () => {
        const stateOverride: DeepPartial<GlobalState> = JSON.parse(JSON.stringify(initialState));
        stateOverride.entities!.users!.currentUserId = 'otherUserId';
        renderWithIntlAndStore(<div id='root-portal'><PurchaseInProgressModal purchaserEmail={'admin@example.com'}/></div>, stateOverride);

        screen.getByText(/Purchase.*attempted by admin@example\.com\. Try again after they.*finish/);
    });

    it('when purchaser and user emails are same, allows user to reset purchase flow', () => {
        renderWithIntlAndStore(<div id='root-portal'><PurchaseInProgressModal purchaserEmail={'admin@example.com'}/></div>, initialState);

        // check title, and some of the most prominent details and secondary actions
        const removeItemSpy = jest.spyOn(storageActions, 'removeItem');
        expect(removeItemSpy).not.toHaveBeenCalled();
        screen.getByText('Reset purchase flow').click();
        expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEY_PURCHASE_IN_PROGRESS);
    });
});
