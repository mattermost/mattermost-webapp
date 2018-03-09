// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {loadMe} from 'actions/user_actions.jsx';
import {browserHistory} from 'utils/browser_history';
import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import Confirm from 'components/mfa/confirm.jsx';
import Constants from 'utils/constants.jsx';

jest.mock('actions/user_actions.jsx', () => ({
    loadMe: jest.fn().mockImplementation(() => Promise.resolve()),
}));

describe('components/mfa/components/Confirm', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(<Confirm history={browserHistory}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should submit on form submit', () => {
        browserHistory.push = jest.fn();
        const wrapper = mountWithIntl(<Confirm history={browserHistory}/>);
        wrapper.find('form').simulate('submit');

        return Promise.resolve().then(() => {
            expect(loadMe).toBeCalled();
            expect(browserHistory.push).toHaveBeenCalledWith('/');
        });
    });

    test('should submit on enter', () => {
        var map = {};
        document.body.addEventListener = jest.fn().mockImplementation((event, cb) => {
            console.log(event);
            map[event] = cb;
        });

        browserHistory.push = jest.fn();
        mountWithIntl(<Confirm history={browserHistory}/>);

        const event = {
            preventDefault: jest.fn(),
            key: Constants.KeyCodes.ENTER[0],
        };
        map.keydown(event);

        return Promise.resolve().then(() => {
            expect(loadMe).toBeCalled();
            expect(browserHistory.push).toHaveBeenCalledWith('/');
        });
    });
});
