// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentType} from 'react';
import PropTypes from 'prop-types';

import {isEmpty} from 'lodash';

interface Actions {
    getCloudSubscription: () => void;
}

interface UsedHocProps {
    subscription: object | null;
    isCloud: boolean;
    actions: Actions;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function withGetCloudSubscription<P>(WrappedComponent: ComponentType<P>) {
    return class extends React.Component<P & UsedHocProps> {
        static propTypes = {
            subscription: PropTypes.object,
            isCloud: PropTypes.bool,
            actions: PropTypes.shape({
                getCloudSubscription: PropTypes.func,
            }).isRequired,
        };
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
