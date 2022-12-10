// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mount} from 'enzyme';

import {CommonProps} from '../common_props';

import {SelectVariantButton} from './dropdown_button';

describe('AppsRHSView/select/button_select', () => {
    const baseProps: CommonProps = {
        app_id: 'test',
        binding: {
            label: 'Test',
        },
        context: {
            app_id: 'test',
        },
        handleBindingClick: jest.fn(),
        viewComponent: jest.fn(),
    };

    test('should match snapshot', () => {
        const wrapper = mount(<SelectVariantButton {...baseProps}/>);

        expect(wrapper).toMatchSnapshot();
    });
});
