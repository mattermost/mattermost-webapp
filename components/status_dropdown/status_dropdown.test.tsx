// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import StatusDropdown from './status_dropdown';

describe('components/StatusDropdown', () => {
    const actions = {
        openModal: jest.fn(),
        setStatus: jest.fn(),
    };

    const baseProps = {
        actions,
    };

    test('should match snapshot in default state', () => {
        const wrapper = shallow(
            <StatusDropdown {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});