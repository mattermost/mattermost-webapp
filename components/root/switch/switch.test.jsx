// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Redirect} from 'react-router-dom';

import Switch from 'components/root/switch/switch.jsx';

describe('components/root/switch/switch', () => {
    const baseProps = {
        location: {
            pathname: '/',
        },
        defaultRoute: '/',
        noAccounts: false,
        mfaRequired: false,
        showTermsOfService: false,
    };

    it('should redirect to mfa when required', () => {
        const props = {
            ...baseProps,
            mfaRequired: true,
        };

        const wrapper = shallow(<Switch {...props}/>);
        const redirectComponents = wrapper.find(Redirect);

        expect(redirectComponents).toHaveLength(2);
        expect(redirectComponents.first()).toMatchInlineSnapshot(`
<Redirect
  key="/mfa?redirect"
  to="/mfa?redirect_to=%2F"
/>
`);
    });

    it('should not redirect to mfa if not required', () => {
        const props = {
            ...baseProps,
            mfaRequired: false,
        };

        const wrapper = shallow(<Switch {...props}/>);

        expect(wrapper.find(Redirect)).toHaveLength(1);
    });

    it('should redirect to mfa if both mfa and terms of service are required', () => {
        const props = {
            ...baseProps,
            mfaRequired: true,
            showTermsOfService: true,
        };

        const wrapper = shallow(<Switch {...props}/>);
        wrapper.setState({
            showTermsOfServiceSet: 1,
            currentUserIdSet: 1,
        });
        const redirectComponents = wrapper.find(Redirect);

        expect(redirectComponents).toHaveLength(3);
        expect(redirectComponents.first()).toMatchInlineSnapshot(`
<Redirect
  key="/mfa?redirect"
  to="/mfa?redirect_to=%2F"
/>
`);
    });

    it('should redirect terms of service when required', () => {
        const props = {
            ...baseProps,
            showTermsOfService: true,
        };

        const wrapper = shallow(<Switch {...props}/>);
        wrapper.setState({
            showTermsOfServiceSet: 1,
            currentUserIdSet: 1,
        });
        const redirectComponents = wrapper.find(Redirect);

        expect(redirectComponents).toHaveLength(2);
        expect(redirectComponents.first()).toMatchInlineSnapshot(`
<Redirect
  key="/terms_of_service?redirect_to"
  to="/terms_of_service?redirect_to=%2F"
/>
`);
    });

    it('should not redirect terms of service if not required', () => {
        const props = {
            ...baseProps,
            showTermsOfService: false,
        };

        const wrapper = shallow(<Switch {...props}/>);
        wrapper.setState({
            showTermsOfServiceSet: 1,
            currentUserIdSet: 1,
        });

        expect(wrapper.find(Redirect)).toHaveLength(1);
    });

    it('should redirect to signup when there are no accounts', () => {
        const props = {
            ...baseProps,
            noAccounts: true,
        };

        const wrapper = shallow(<Switch {...props}/>);
        const redirectComponents = wrapper.find(Redirect);

        expect(redirectComponents).toHaveLength(2);
        expect(redirectComponents.first()).toMatchInlineSnapshot(`
<Redirect
  key="/signup_user_complete"
  to="/signup_user_complete"
/>
`);
    });

    it('should not redirect to signup if there are accounts already', () => {
        const props = {
            ...baseProps,
            noAccounts: false,
        };

        const wrapper = shallow(<Switch {...props}/>);

        expect(wrapper.find(Redirect)).toHaveLength(1);
    });
});
