// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import ShouldVerifyEmail from './should_verify_email';

describe('components/ShouldVerifyEmail', () => {
    const baseProps = {
        location: {
            search: '',
        },
        siteName: 'Mattermost',
        actions: {
            sendVerificationEmail: jest.fn().mockResolvedValue({data: true}),
        },
    };

    it('should match snapshot', () => {
        const wrapper = shallowWithIntl(<ShouldVerifyEmail {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should call the sendVerificationEmail() action on click the button', () => {
        const props = {
            ...baseProps,
            location: {
                search: '?email=test@example.com',
            },
        };

        const wrapper = shallowWithIntl(<ShouldVerifyEmail {...props}/>);
        wrapper.find('button').simulate('click');

        expect(props.actions.sendVerificationEmail).toHaveBeenCalledWith('test@example.com');
    });
});
