// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {switchMap} from 'rxjs/operators';
import {ofType} from 'redux-observable';
import {of} from 'rxjs/observable/of';
import {empty} from 'rxjs/observable/empty';

import {AdminTypes} from '../../action_types';
import {getLicense, getSubscriptionStats as selectSubscriptionStats} from '../../selectors/entities/general';
import {getSubscriptionStats} from '../../actions/cloud';

export const changeToCloudLicenseEpic = (action$: any, state$: any) =>
    action$.pipe(
        ofType(AdminTypes.UPLOAD_LICENSE_SUCCESS),
        switchMap(() => {
            const state = state$.value;
            const license = getLicense(state);

            const isCloud = license.Cloud === 'true';
            const subscriptionStats = selectSubscriptionStats(state);

            if (subscriptionStats === null && isCloud) {
                return of(getSubscriptionStats());
            }

            return empty();
        }),
    );
