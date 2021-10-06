// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {redirectUserToDefaultTeam} from 'actions/global_actions';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import Confirm from 'components/mfa/confirm';
import Constants from 'utils/constants';

jest.mock('actions/global_actions', () => ({
    redirectUserToDefaultTeam: jest.fn(),
}));

describe('components/mfa/components/Confirm', () => {
    const originalAddEventListener = document.body.addEventListener;

    const defaultProps = {
        updateParent: jest.fn(),
        state: {
            enforceMultifactorAuthentication: true,
        },
    };

    afterAll(() => {
        document.body.addEventListener = originalAddEventListener;
    });

    test('should match snapshot', () => {
        const wrapper = shallow(<Confirm {...defaultProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should submit on form submit', () => {
        const wrapper = mountWithIntl(<Confirm {...defaultProps}/>);
        wrapper.find('form').simulate('submit');

        expect(redirectUserToDefaultTeam).toHaveBeenCalled();
    });

    test('should submit on enter', () => {
        const wrapper = mountWithIntl(<Confirm {...defaultProps}/>);

        wrapper.simulate('keydown', {
            preventDefault: jest.fn(),
            key: Constants.KeyCodes.ENTER[0],
            keyCode: Constants.KeyCodes.ENTER[1],
            ctrlKey: false,
        });

        expect(redirectUserToDefaultTeam).toHaveBeenCalled();
    });
});
