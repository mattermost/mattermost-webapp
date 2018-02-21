// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import EmailConnectionTestButton from 'components/admin_console/email_connection_test/email_connection_test.jsx';

describe('components/admin_console/email_connection_test/email_connection_test', () => {
    test('should match snapshot, disabled', () => {
        const baseProps = {
            config: {},
            getConfigFromState: jest.fn(),
            disabled: true,
            actions: {
                testEmail: jest.fn(() => Promise.resolve({})),
            },
        };

        const wrapper = shallow(
            <EmailConnectionTestButton {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, enable', () => {
        const baseProps = {
            config: {},
            getConfigFromState: jest.fn(),
            disabled: false,
            actions: {
                testEmail: jest.fn(() => Promise.resolve({})),
            },
        };

        const wrapper = shallow(
            <EmailConnectionTestButton {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have called handleTestConnection', () => {
        const baseProps = {
            config: {},
            getConfigFromState: jest.fn(),
            disabled: false,
            actions: {
                testEmail: jest.fn(() => Promise.resolve({})),
            },
        };

        const wrapper = shallow(
            <EmailConnectionTestButton {...baseProps}/>
        );

        const preventDefault = jest.fn();

        wrapper.find('button').first().simulate('click', {preventDefault});
        expect(baseProps.actions.testEmail).toHaveBeenCalledTimes(1);
    });
});
