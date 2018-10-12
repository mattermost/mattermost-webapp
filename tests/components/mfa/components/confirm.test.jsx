// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {browserHistory} from 'utils/browser_history';
import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import Confirm from 'components/mfa/confirm';
import Constants from 'utils/constants.jsx';

describe('components/mfa/components/Confirm', () => {
    const baseProps = {
        history: browserHistory,
    };

    const originalAddEventListener = document.body.addEventListener;
    afterAll(() => {
        document.body.addEventListener = originalAddEventListener;
    });

    test('should match snapshot', () => {
        const wrapper = shallow(<Confirm {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should submit on form submit', () => {
        const props = {
            history: {
                push: jest.fn(),
            },
        };

        const wrapper = mountWithIntl(<Confirm {...props}/>);
        wrapper.find('form').simulate('submit');

        expect(props.history.push).toHaveBeenCalledWith('/');
    });

    test('should submit on enter', () => {
        const props = {
            history: {
                push: jest.fn(),
            },
        };

        const map = {};
        document.body.addEventListener = jest.fn().mockImplementation((event, cb) => {
            map[event] = cb;
        });

        mountWithIntl(<Confirm {...props}/>);

        const event = {
            preventDefault: jest.fn(),
            key: Constants.KeyCodes.ENTER[0],
        };
        map.keydown(event);

        expect(props.history.push).toHaveBeenCalledWith('/');
    });
});
