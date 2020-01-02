// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {createMemoryHistory, createLocation} from 'history';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import GetAndroidApp from 'components/get_android_app/get_android_app';

jest.mock('images/favicon/android-chrome-192x192.png', () => 'favicon.png');
jest.mock('images/nexus-6p-mockup.png', () => 'mockup.png');

describe('components/GetAndroidApp', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <GetAndroidApp
                androidAppDownloadLink={'https://about.mattermost.com/mattermost-android-app'}
                history={createMemoryHistory()}
                location={createLocation('/')}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should contain the download link', () => {
        const wrapper = shallow(
            <GetAndroidApp
                androidAppDownloadLink={'https://about.mattermost.com/mattermost-android-app'}
                history={createMemoryHistory()}
                location={createLocation('/')}
            />
        );

        const link = wrapper.find('.get-android-app__app-store-link');
        expect(link.prop('href')).toEqual('https://about.mattermost.com/mattermost-android-app');
    });

    test('should redirect if the user chooses to stay in the browser. Redirect url param is present', () => {
        const history = createMemoryHistory();
        history.push = jest.fn();

        const location = createLocation('/');
        location.search = '?redirect_to=last_page';

        const wrapper = mountWithIntl(
            <GetAndroidApp
                androidAppDownloadLink={'https://about.mattermost.com/mattermost-android-app'}
                history={history}
                location={location}
            />
        );
        expect(history.push).not.toHaveBeenCalled();

        const link = wrapper.find('.get-android-app__continue');
        link.simulate('click');
        expect(history.push).toHaveBeenCalledWith('last_page');
    });

    test('should redirect if the user chooses to stay in the browser. Redirect url param is not present', () => {
        const history = createMemoryHistory();
        history.push = jest.fn();

        const location = createLocation('/');
        location.search = '';

        const wrapper = mountWithIntl(
            <GetAndroidApp
                androidAppDownloadLink={'https://about.mattermost.com/mattermost-android-app'}
                history={history}
                location={location}
            />
        );
        expect(history.push).not.toHaveBeenCalled();

        const link = wrapper.find('.get-android-app__continue');
        link.simulate('click');
        expect(history.push).toHaveBeenCalledWith('/');
    });
});
