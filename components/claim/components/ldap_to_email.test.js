// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import LDAPToEmail from './ldap_to_email.jsx';

describe('components/claim/components/ldap_to_email.jsx', () => {
    const requiredProps = {
        email: '',
        passwordConfig: {},
        switchLdapToEmail: jest.fn(() => Promise.resolve({data: true})),
    };

    test('submit() should have called switchLdapToEmail', async () => {
        const loginId = '';
        const password = 'psw';
        const token = 'abcd1234';
        const ldapPassword = 'ldapPsw';

        const wrapper = shallow(<LDAPToEmail {...requiredProps}/>);

        await wrapper.instance().submit(loginId, password, token, ldapPassword);

        expect(requiredProps.switchLdapToEmail).toHaveBeenCalledTimes(1);
        expect(requiredProps.switchLdapToEmail).
            toHaveBeenCalledWith(ldapPassword, requiredProps.email, password, token);
    });
});
