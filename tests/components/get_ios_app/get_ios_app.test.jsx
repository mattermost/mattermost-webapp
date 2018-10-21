// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import GetIosApp from 'components/get_ios_app/get_ios_app.jsx';

jest.mock('images/app-store-button.png', () => 'store-button.png');
jest.mock('images/iphone-6-mockup.png', () => 'mockup.png');

describe('components/GetIosApp', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <GetIosApp
                iosAppDownloadLink={'https://about.mattermost.com/mattermost-ios-app'}
                history={{goBack: jest.fn()}}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should contain the download link', () => {
        const wrapper = shallow(
            <GetIosApp
                iosAppDownloadLink={'https://about.mattermost.com/mattermost-ios-app'}
                history={{goBack: jest.fn()}}
            />
        );

        const link = wrapper.find('.get-ios-app__app-store-link');
        expect(link.prop('href')).toEqual('https://about.mattermost.com/mattermost-ios-app');
    });

    test('should return to previous page if user chooses to stay in the browser', () => {
        const goBack = jest.fn();
        const wrapper = mountWithIntl(
            <GetIosApp
                iosAppDownloadLink={'https://about.mattermost.com/mattermost-ios-app'}
                history={{goBack}}
            />
        );
        expect(goBack).not.toHaveBeenCalled();

        const link = wrapper.find('.get-ios-app__continue');
        link.simulate('click');
        expect(goBack).toHaveBeenCalled();
    });
});
