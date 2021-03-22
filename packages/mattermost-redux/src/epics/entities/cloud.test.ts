// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Observable} from 'rxjs/Observable';
import {defaultIfEmpty} from 'rxjs/operators';

import 'rxjs/add/observable/of';
import state from '../../store/initial_state';
import {AdminTypes} from '../../action_types';
import {Client4} from '../../client';
import {SubscriptionStats} from '../../types/cloud';

import {changeToCloudLicenseEpic} from './cloud';

describe('changeToCloudLicenseEpic', () => {
    it('should call getSubscriptionStats when licence is changed to cloud', (done) => {
        const type = AdminTypes.UPLOAD_LICENSE_SUCCESS;
        const action$ = Observable.of({type});
        const stateCopy = JSON.parse(JSON.stringify(state));
        stateCopy.entities.general.license = {
            Cloud: 'true',
        };
        stateCopy.entities.cloud.subscriptionStats = null;
        const state$ = {
            value: stateCopy,
        };
        const epic$ = changeToCloudLicenseEpic(action$, state$);

        const expectedData = {
            remaining_seats: 5,
            is_paid_tier: 'false',
        };

        const promise = new Promise<SubscriptionStats>((resolve) => {
            resolve(expectedData);
        });
        const mock = jest.spyOn(Client4, 'getSubscriptionStats');
        mock.mockImplementation(() => promise);

        epic$.subscribe(async (actionFunc: any) => {
            const result = await actionFunc(jest.fn(), jest.fn());
            expect(result.data).toBe(expectedData);
            done();
        });
        mock.mockRestore();
    });

    it('should call not call anything when licence is changed to non-cloud', () => {
        const type = AdminTypes.UPLOAD_LICENSE_SUCCESS;
        const action$ = Observable.of({type});
        const stateCopy = JSON.parse(JSON.stringify(state));
        stateCopy.entities.general.license = {
            Cloud: 'false',
        };
        stateCopy.entities.cloud.subscriptionStats = null;
        const state$ = {
            value: stateCopy,
        };
        const epic$ = changeToCloudLicenseEpic(action$, state$);

        // dealing with the empty observable due to return of Observable.empty() in epic
        epic$.pipe(defaultIfEmpty(false)).subscribe((va: boolean) => expect(va).toBe(false));
    });
});
