// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {createMemoryHistory, createLocation} from 'history';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import GetIosApp from 'components/get_ios_app/get_ios_app';

jest.mock('images/app-store-button.png', () => 'store-button.png');
jest.mock('images/iphone-6-mockup.png', () => 'mockup.png');

describe('components/GetIosApp', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <GetIosApp
                iosAppDownloadLink={'https://about.mattermost.com/mattermost-ios-app'}
                history={createMemoryHistory()}
                location={createLocation('/')}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should contain the download link', () => {
        const wrapper = shallow(
            <GetIosApp
                iosAppDownloadLink={'https://about.mattermost.com/mattermost-ios-app'}
                history={createMemoryHistory()}
                location={createLocation('/')}
            />
        );

        const link = wrapper.find('.get-ios-app__app-store-link');
        expect(link.prop('href')).toEqual('https://about.mattermost.com/mattermost-ios-app');
    });

    test('should redirect if the user chooses to stay in the browser. Redirect url param is present', () => {
        const history = createMemoryHistory();
        history.push = jest.fn();

        const location = createLocation('/');
        location.search = '?redirect_to=last_page';
        const wrapper = mountWithIntl(
            <GetIosApp
                iosAppDownloadLink={'https://about.mattermost.com/mattermost-ios-app'}
                history={history}
                location={location}
            />
        );

        expect(history.push).not.toHaveBeenCalled();

        const link = wrapper.find('.get-ios-app__continue');
        link.simulate('click');
        expect(history.push).toHaveBeenCalledWith('last_page');
    });

    test('should redirect if the user chooses to stay in the browser. Redirect url param is not present', () => {
        const history = createMemoryHistory();
        history.push = jest.fn();

        const location = createLocation('/');
        location.search = '';
        const wrapper = mountWithIntl(
            <GetIosApp
                iosAppDownloadLink={'https://about.mattermost.com/mattermost-ios-app'}
                history={history}
                location={location}
            />
        );

        expect(history.push).not.toHaveBeenCalled();

        const link = wrapper.find('.get-ios-app__continue');
        link.simulate('click');
        expect(history.push).toHaveBeenCalledWith('/');
    });
});
