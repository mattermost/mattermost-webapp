// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import LDAPToEmail from './ldap_to_email';

describe('components/claim/components/ldap_to_email.jsx', () => {
    const requiredProps = {
        email: '',
        passwordConfig: {
            minimumLength: 5,
            requireLowercase: true,
            requireUppercase: true,
            requireNumber: true,
            requireSymbol: true,
        },
        switchLdapToEmail: jest.fn(() => Promise.resolve({data: true})),
    };

    test('submit() should have called switchLdapToEmail', async () => {
        const loginId = '';
        const password = 'psw';
        const token = 'abcd1234';
        const ldapPassword = 'ldapPsw';

        const wrapper = shallow(<LDAPToEmail {...requiredProps}/>);

        wrapper.find('form').simulate('submit', {preventDefault: jest.fn()});
        wrapper.find('form').prop('onSubmit'); // todo delete one of the options

        // await wrapper.instance().submit(loginId, password, token, ldapPassword);

        expect(requiredProps.switchLdapToEmail).toHaveBeenCalledTimes(1);
        expect(requiredProps.switchLdapToEmail).
            toHaveBeenCalledWith(ldapPassword, requiredProps.email, password, token);
    });
});
