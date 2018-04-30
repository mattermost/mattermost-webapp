// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import S3ConnectionTestButton from 'components/admin_console/s3_connection_test/s3_connection_test.jsx';

describe('components/admin_console/s3_connection_test/s3_connection_test', () => {
    test('should match snapshot, disabled', () => {
        const baseProps = {
            config: {},
            getConfigFromState: jest.fn(),
            disabled: true,
            actions: {
                testS3Connection: jest.fn(() => Promise.resolve({})),
            },
        };

        const wrapper = shallow(
            <S3ConnectionTestButton {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, enable', () => {
        const baseProps = {
            config: {},
            getConfigFromState: jest.fn(),
            disabled: false,
            actions: {
                testS3Connection: jest.fn(() => Promise.resolve({})),
            },
        };

        const wrapper = shallow(
            <S3ConnectionTestButton {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have called handleTestConnection', () => {
        const baseProps = {
            config: {},
            getConfigFromState: jest.fn(),
            disabled: false,
            actions: {
                testS3Connection: jest.fn(() => Promise.resolve({})),
            },
        };

        const wrapper = shallow(
            <S3ConnectionTestButton {...baseProps}/>
        );

        const preventDefault = jest.fn();

        wrapper.find('button').first().simulate('click', {preventDefault});
        expect(baseProps.actions.testS3Connection).toHaveBeenCalledTimes(1);
    });
});
