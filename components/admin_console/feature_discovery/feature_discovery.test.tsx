// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import FeatureDiscovery from 'components/admin_console/feature_discovery/feature_discovery';

describe('components/feature_discovery', () => {
    describe('FeatureDiscovery', () => {
        test('should match snapshot', () => {
            const wrapper = shallow(
                <FeatureDiscovery
                    titleID='translation.test.title'
                    titleDefault='Foo'
                    copyID='translation.test.copy'
                    copyDefault={'Bar'}
                    primaryURL='https://test.mattermost.com/primary/'
                    secondaryURL='https://test.mattermost.com/secondary/'
                    imgPath='foo/bar.png'
                />
            );
            expect(wrapper).toMatchSnapshot();
        });
    });
});
