// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import StatusDropdown from './status_dropdown';

describe('components/StatusDropdown', () => {
    const actions = {
        openModal: jest.fn(),
        setStatus: jest.fn(),
        unsetCustomStatus: jest.fn(),
        setStatusDropdown: jest.fn(),
    };

    const baseProps = {
        actions,
        userId: '',
        isCustomStatusEnabled: false,
        isStatusDropdownOpen: false,
        showCustomStatusPulsatingDot: false,
    };

    test('should match snapshot in default state', () => {
        const wrapper = shallow(
            <StatusDropdown {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with profile picture URL', () => {
        const props = {
            ...baseProps,
            profilePicture: 'http://localhost:8065/api/v4/users/jsx5jmdiyjyuzp9rzwfaf5pwjo/image?_=1590519110944',
        };

        const wrapper = shallow(
            <StatusDropdown {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with status dropdown open', () => {
        const props = {
            ...baseProps,
            isStatusDropdownOpen: true,
        };

        const wrapper = shallow(
            <StatusDropdown {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with custom status enabled', () => {
        const props = {
            ...baseProps,
            isStatusDropdownOpen: true,
            isCustomStatusEnabled: true,
        };

        const wrapper = shallow(
            <StatusDropdown {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with custom status pulsating dot enabled', () => {
        const props = {
            ...baseProps,
            isStatusDropdownOpen: true,
            isCustomStatusEnabled: true,
            showCustomStatusPulsatingDot: true,
        };

        const wrapper = shallow(
            <StatusDropdown {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
