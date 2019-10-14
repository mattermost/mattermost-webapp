// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {browserHistory} from 'utils/browser_history.jsx';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import Confirm from 'components/mfa/confirm.jsx';
import Constants from 'utils/constants.jsx';

jest.mock('utils/browser_history.jsx', () => ({
    browserHistory: {
        push: jest.fn(),
    },
}));

describe('components/mfa/components/Confirm', () => {
    const originalAddEventListener = document.body.addEventListener;
    afterAll(() => {
        document.body.addEventListener = originalAddEventListener;
    });

    test('should match snapshot', () => {
        const wrapper = shallow(<Confirm/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should submit on form submit', () => {
        const wrapper = mountWithIntl(<Confirm/>);
        wrapper.find('form').simulate('submit');

        expect(browserHistory.push).toHaveBeenCalledWith('/');
    });

    test('should submit on enter', () => {
        const map = {};
        document.body.addEventListener = jest.fn().mockImplementation((event, cb) => {
            map[event] = cb;
        });

        mountWithIntl(<Confirm/>);

        const event = {
            preventDefault: jest.fn(),
            key: Constants.KeyCodes.ENTER[0],
        };
        map.keydown(event);

        expect(browserHistory.push).toHaveBeenCalledWith('/');
    });
});
