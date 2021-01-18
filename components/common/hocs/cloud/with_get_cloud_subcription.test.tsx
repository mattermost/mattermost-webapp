// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentType} from 'react';
import {mount} from 'enzyme';

import withGetCloudSubscription from './with_get_cloud_subcription';

describe('/components/common/hocs/with_get_cloud_subcription', () => {
    let TestComponent: ComponentType;

    beforeEach(() => {
        TestComponent = () => <div/>;
    });

    test('should call the getCloudSubscription when cloud license is being used and no subscription was fetched', () => {
        const EnhancedComponent = withGetCloudSubscription(TestComponent);
        const actions = {
            getCloudSubscription: () => {},
        };

        const getCloudSubscriptionSpy = jest.spyOn(actions, 'getCloudSubscription');

        mount(
            <EnhancedComponent
                isCloud={true}
                actions={actions}
                subscription={{}}
            />,
        );

        expect(getCloudSubscriptionSpy).toHaveBeenCalledTimes(1);
    });

    test('should NOT call the getCloudSubscription when NOT cloud licenced', () => {
        const EnhancedComponent = withGetCloudSubscription(TestComponent);
        const actions = {
            getCloudSubscription: () => {},
        };

        const getCloudSubscriptionSpy = jest.spyOn(actions, 'getCloudSubscription');

        mount(
            <EnhancedComponent
                isCloud={false}
                actions={actions}
                subscription={{}}
            />,
        );

        expect(getCloudSubscriptionSpy).toHaveBeenCalledTimes(0);
    });
});
