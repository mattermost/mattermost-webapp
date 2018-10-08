// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TermsOfService from 'components/terms_of_service/terms_of_service.jsx';

import {emitUserLoggedOutEvent} from 'actions/global_actions.jsx';
import {getTermsOfService, updateTermsOfServiceStatus} from 'actions/user_actions.jsx';

jest.mock('actions/global_actions.jsx', () => ({
    emitUserLoggedOutEvent: jest.fn(),
}));

jest.mock('actions/user_actions.jsx', () => ({
    getTermsOfService: jest.fn(),
    updateTermsOfServiceStatus: jest.fn(),
}));

describe('components/terms_of_service/TermsOfService', () => {
    const baseProps = {
        customTermsOfServiceId: '1',
        privacyPolicyLink: 'https://about.mattermost.com/default-privacy-policy/',
        siteName: 'Mattermost',
        termsEnabled: true,
        termsOfServiceLink: 'https://about.mattermost.com/default-terms/',
    };

    test('should match snapshot', () => {
        const props = {...baseProps};
        const wrapper = shallow(<TermsOfService {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should call getTermsOfService on mount', () => {
        const props = {...baseProps};
        shallow(<TermsOfService {...props}/>);
        expect(getTermsOfService).toHaveBeenCalledTimes(1);
    });

    test('should match snapshot on loading', () => {
        const props = {...baseProps};
        const wrapper = shallow(<TermsOfService {...props}/>);
        wrapper.setState({loading: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on accept terms', () => {
        const props = {...baseProps};
        const wrapper = shallow(<TermsOfService {...props}/>);
        wrapper.setState({loadingAgree: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on reject terms', () => {
        const props = {...baseProps};
        const wrapper = shallow(<TermsOfService {...props}/>);
        wrapper.setState({loadingDisagree: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should call updateTermsOfServiceStatus on registerUserAction', () => {
        const wrapper = shallow(<TermsOfService {...baseProps}/>);
        wrapper.instance().registerUserAction({accepted: 'true', success: jest.fn()});
        expect(updateTermsOfServiceStatus).toHaveBeenCalledTimes(1);
    });

    test('should match state and call updateTermsOfServiceStatus on handleAcceptTerms', () => {
        const wrapper = shallow(<TermsOfService {...baseProps}/>);
        wrapper.instance().handleAcceptTerms();
        expect(wrapper.state('loadingAgree')).toEqual(true);
        expect(wrapper.state('serverError')).toEqual(null);
        expect(updateTermsOfServiceStatus).toHaveBeenCalledTimes(1);
    });

    test('should match state and call updateTermsOfServiceStatus on handleRejectTerms', () => {
        const wrapper = shallow(<TermsOfService {...baseProps}/>);
        wrapper.instance().handleRejectTerms();
        expect(wrapper.state('loadingDisagree')).toEqual(true);
        expect(wrapper.state('serverError')).toEqual(null);
        expect(updateTermsOfServiceStatus).toHaveBeenCalledTimes(1);
    });

    test('should call emitUserLoggedOutEvent on handleLogoutClick', () => {
        const wrapper = shallow(<TermsOfService {...baseProps}/>);
        wrapper.instance().handleLogoutClick({preventDefault: jest.fn()});
        expect(emitUserLoggedOutEvent).toHaveBeenCalledTimes(1);
        expect(emitUserLoggedOutEvent).toHaveBeenCalledWith('/login');
    });
});
