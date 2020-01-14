// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import PasswordResetForm from './password_reset_form';

jest.mock('utils/browser_history', () => ({
    browserHistory: {
        push: jest.fn(),
    },
}));

describe('components/PasswordResetForm', () => {
    const baseProps = {
        location: {
            search: '',
        },
        siteName: 'Mattermost',
        actions: {
            resetUserPassword: jest.fn().mockResolvedValue({data: true}),
        },
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<PasswordResetForm {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should call the resetUserPassword() action on submit', () => {
        const props = {
            ...baseProps,
            location: {
                search: '?token=TOKEN',
            },
        };

        const wrapper = mountWithIntl(<PasswordResetForm {...props}/>);
        wrapper.instance().passwordInput.current.value = 'PASSWORD';
        wrapper.find('form').simulate('submit', {preventDefault: () => {}});

        expect(props.actions.resetUserPassword).toHaveBeenCalledWith('TOKEN', 'PASSWORD');
    });
});
