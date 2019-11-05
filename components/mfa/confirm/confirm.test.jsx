// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import Confirm from 'components/mfa/confirm/confirm.jsx';
import Constants from 'utils/constants';

describe('components/mfa/components/Confirm', () => {
    const actions = {
        redirectUserToDefaultTeam: jest.fn(),
    };

    const props = {
        actions,
    };

    const originalAddEventListener = document.body.addEventListener;
    afterAll(() => {
        document.body.addEventListener = originalAddEventListener;
    });

    test('should match snapshot', () => {
        const wrapper = shallow(<Confirm {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should submit on form submit', () => {
        const wrapper = mountWithIntl(<Confirm {...props}/>);
        wrapper.find('form').simulate('submit');

        expect(actions.redirectUserToDefaultTeam).toHaveBeenCalled();
    });

    test('should submit on enter', () => {
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

        expect(actions.redirectUserToDefaultTeam).toHaveBeenCalled();
    });
});
