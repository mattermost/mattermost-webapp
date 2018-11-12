// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import GetAndroidApp from 'components/get_android_app/get_android_app.jsx';

jest.mock('images/favicon/android-chrome-192x192.png', () => 'favicon.png');
jest.mock('images/nexus-6p-mockup.png', () => 'mockup.png');

describe('components/GetAndroidApp', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <GetAndroidApp
                androidAppDownloadLink={'https://about.mattermost.com/mattermost-android-app'}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should contain the download link', () => {
        const wrapper = shallow(
            <GetAndroidApp
                androidAppDownloadLink={'https://about.mattermost.com/mattermost-android-app'}
            />
        );

        const link = wrapper.find('.get-android-app__app-store-link');
        expect(link.prop('href')).toEqual('https://about.mattermost.com/mattermost-android-app');
    });

    test('should redirect if the user chooses to stay in the browser. Redirect url param is present', () => {
        const push = jest.fn();
        const wrapper = mountWithIntl(
            <GetAndroidApp
                androidAppDownloadLink={'https://about.mattermost.com/mattermost-android-app'}
                history={{push}}
                location={{search: '?redirect_to=last_page'}}
            />
        );
        expect(push).not.toHaveBeenCalled();

        const link = wrapper.find('.get-android-app__continue');
        link.simulate('click');
        expect(push).toHaveBeenCalledWith('last_page');
    });

    test('should redirect if the user chooses to stay in the browser. Redirect url param is not present', () => {
        const push = jest.fn();
        const wrapper = mountWithIntl(
            <GetAndroidApp
                androidAppDownloadLink={'https://about.mattermost.com/mattermost-android-app'}
                history={{push}}
                location={{search: ''}}
            />
        );
        expect(push).not.toHaveBeenCalled();

        const link = wrapper.find('.get-android-app__continue');
        link.simulate('click');
        expect(push).toHaveBeenCalledWith('/');
    });
});
