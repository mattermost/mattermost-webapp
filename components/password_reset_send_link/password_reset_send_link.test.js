// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {MemoryRouter} from 'react-router';

import {shallowWithIntl, mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import PasswordResetSendLink from './password_reset_send_link';

describe('components/PasswordResetSendLink', () => {
    const baseProps = {
        actions: {
            sendPasswordResetEmail: jest.fn().mockResolvedValue({data: true}),
        },
    };

    it('should match snapshot', () => {
        const wrapper = shallowWithIntl(<PasswordResetSendLink {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should calls sendPasswordResetEmail() action on submit', () => {
        const props = {...baseProps};

        const wrapper = mountWithIntl(
            <MemoryRouter>
                <PasswordResetSendLink {...props}/>
            </MemoryRouter>
        ).children().children();

        wrapper.instance().emailInput.current.input.current.value = 'test@example.com';
        wrapper.find('form').simulate('submit', {preventDefault: () => {}});

        expect(props.actions.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com');
    });
});
