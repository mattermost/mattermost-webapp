// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentType} from 'react';

import {isEmpty} from 'lodash';

import {Subscription} from 'mattermost-redux/types/cloud';

interface Actions {
    getCloudSubscription: () => void;
}

interface UsedHocProps {
    subscription: Subscription;
    isCloud: boolean;
    actions: Actions;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withGetCloudSubscription<P>(WrappedComponent: ComponentType<P>): ComponentType<any> {
    return class extends React.Component<P & UsedHocProps> {
        async componentDidMount() {
            const {subscription, actions, isCloud} = this.props;
            if (isEmpty(subscription) && isCloud) {
                await actions.getCloudSubscription();
            }
        }

        render(): JSX.Element {
            return <WrappedComponent {...this.props}/>;
        }
    };
}

export default withGetCloudSubscription;
