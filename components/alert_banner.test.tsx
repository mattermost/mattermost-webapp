// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AlertBanner from './alert_banner';

describe('Components/AlertBanner', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <AlertBanner
                mode='info'
                message='message'
                title='title'
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for app variant', () => {
        const wrapper = shallow(
            <AlertBanner
                mode='info'
                message='message'
                title='title'
                variant='app'
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
