// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

jest.mock('utils/browser_history');

import React from 'react';

import MfaSection from 'components/user_settings/security/mfa_section/mfa_section';
import {mountWithIntl, shallowWithIntl} from 'tests/helpers/intl-test-helper';
import {browserHistory} from 'utils/browser_history';

describe('MfaSection', () => {
    const baseProps = {
        active: true,
        mfaActive: false,
        mfaAvailable: true,
        mfaEnforced: false,
        updateSection: jest.fn(),
        actions: {
            deactivateMfa: jest.fn(() => Promise.resolve({})),
        },
    };

    describe('rendering', () => {
        test('should render nothing when MFA is not available', () => {
            const props = {
                ...baseProps,
                mfaAvailable: false,
            };
            const wrapper = shallowWithIntl(<MfaSection {...props}/>);

            expect(wrapper).toMatchSnapshot();
        });

        test('when section is collapsed and MFA is not active', () => {
            const props = {
                ...baseProps,
                active: false,
                mfaActive: false,
            };
            const wrapper = shallowWithIntl(<MfaSection {...props}/>);

            expect(wrapper).toMatchSnapshot();
        });

        test('when section is collapsed and MFA is active', () => {
            const props = {
                ...baseProps,
                active: false,
                mfaActive: true,
            };
            const wrapper = shallowWithIntl(<MfaSection {...props}/>);

            expect(wrapper).toMatchSnapshot();
        });

        test('when section is expanded and MFA is not active', () => {
            const props = {
                ...baseProps,
                mfaActive: false,
            };
            const wrapper = shallowWithIntl(<MfaSection {...props}/>);

            expect(wrapper).toMatchSnapshot();
        });

        test('when section is expanded and MFA is active but not enforced', () => {
            const props = {
                ...baseProps,
                mfaActive: true,
            };
            const wrapper = shallowWithIntl(<MfaSection {...props}/>);

            expect(wrapper).toMatchSnapshot();
        });

        test('when section is expanded and MFA is active and enforced', () => {
            const props = {
                ...baseProps,
                mfaActive: true,
                mfaEnforced: true,
            };
            const wrapper = shallowWithIntl(<MfaSection {...props}/>);

            expect(wrapper).toMatchSnapshot();
        });

        test('when section is expanded with a server error', () => {
            const props = {
                ...baseProps,
                serverError: 'An error occurred',
            };
            const wrapper = shallowWithIntl(<MfaSection {...props}/>);

            wrapper.setState({serverError: 'An error has occurred'});

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('setupMfa', () => {
        it('should send to setup page', () => {
            const wrapper = mountWithIntl(<MfaSection {...baseProps}/>);

            wrapper.instance().setupMfa({preventDefault: jest.fn()});

            expect(browserHistory.push).toHaveBeenCalledWith('/mfa/setup');
        });
    });

    describe('removeMfa', () => {
        it('on success, should close section and clear state', async () => {
            const wrapper = mountWithIntl(<MfaSection {...baseProps}/>);

            wrapper.setState({serverError: 'An error has occurred'});

            await wrapper.instance().removeMfa({preventDefault: jest.fn()});

            expect(baseProps.updateSection).toHaveBeenCalledWith('');
            expect(wrapper.state('serverError')).toEqual(null);
            expect(browserHistory.push).not.toHaveBeenCalled();
        });

        it('on success, should send to setup page if MFA enforcement is enabled', async () => {
            const props = {
                ...baseProps,
                mfaEnforced: true,
            };

            const wrapper = mountWithIntl(<MfaSection {...props}/>);

            await wrapper.instance().removeMfa({preventDefault: jest.fn()});

            expect(baseProps.updateSection).not.toHaveBeenCalled();
            expect(browserHistory.push).toHaveBeenCalledWith('/mfa/setup');
        });

        it('on error, should show error', async () => {
            const error = {message: 'An error occurred'};

            const wrapper = mountWithIntl(<MfaSection {...baseProps}/>);

            baseProps.actions.deactivateMfa.mockImplementation(() => Promise.resolve({error}));

            await wrapper.instance().removeMfa({preventDefault: jest.fn()});

            expect(baseProps.updateSection).not.toHaveBeenCalled();
            expect(wrapper.state('serverError')).toEqual(error.message);
        });
    });
});
