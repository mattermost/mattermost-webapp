// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentType} from 'react';

import {isEmpty} from 'lodash';

import {Subscription, SubscriptionStats} from 'mattermost-redux/types/cloud';

interface Actions {
    getCloudSubscription?: () => void;
    getSubscriptionStats?: () => void;
}

interface UsedHocProps {
    subscription?: Subscription;
    subscriptionStats?: SubscriptionStats;
    isCloud: boolean;
    actions: Actions;
    userIsAdmin?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withGetCloudSubscription<P>(WrappedComponent: ComponentType<P>): ComponentType<any> {
    return class extends React.Component<P & UsedHocProps> {
        async componentDidMount() {
            const {subscription, actions: {getSubscriptionStats, getCloudSubscription}, isCloud, userIsAdmin, subscriptionStats} = this.props;

            if (isEmpty(subscriptionStats) && isCloud) {
                if (getSubscriptionStats) {
                    await getSubscriptionStats();
                }
            }

            if (isEmpty(subscription) && isCloud && userIsAdmin) {
                if (getCloudSubscription) {
                    await getCloudSubscription();
                }
            }
        }

        render(): JSX.Element {
            return <WrappedComponent {...this.props}/>;
        }
    };
}

export default withGetCloudSubscription;
