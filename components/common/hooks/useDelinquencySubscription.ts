// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {useSelector} from 'react-redux';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from 'types/store';
import {isSystemAdmin} from 'mattermost-redux/utils/user_utils';

import useGetSubscription, {assertIsSubscription} from './useGetSubscription';

interface UseDelinquencySubscriptionArgs {
    checkAdmin: boolean;
}

export const useDelinquencySubscription = ({checkAdmin}: UseDelinquencySubscriptionArgs) => {
    const subscription = useGetSubscription();
    const currentUser = useSelector((state: GlobalState) =>
        getCurrentUser(state),
    );

    const isDelinquencySubscription = (): boolean => {
        if (!subscription) {
            return false;
        }

        if (!checkAdmin === isSystemAdmin(currentUser.roles)) {
            return false;
        }

        if (!subscription.delinquent_since) {
            return false;
        }

        return true;
    };

    const isDelinquencySubscriptionHigherThan90Days = (): boolean => {
        if (!isDelinquencySubscription()) {
            return false;
        }

        try {
            /**
             * This is a TS "limitation", we know reading the code that subscription isn't undefined but
             * TS can't infer it so we are helping TS to infer it correctly using asserts functions.
             */
            assertIsSubscription(subscription, "Subscription is null when it shouldn't");

            const delinquencyDate = new Date((subscription.delinquent_since || 0) * 1000);

            const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            const today = new Date();
            const diffDays = Math.round(
                Math.abs((today.valueOf() - delinquencyDate.valueOf()) / oneDay),
            );

            return diffDays > 90;
        } catch {
            return false;
        }
    };

    return {isDelinquencySubscription, isDelinquencySubscriptionHigherThan90Days, subscription};
};
