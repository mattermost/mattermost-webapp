// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SettingItemMin from 'components/setting_item_min.jsx';

describe('components/SettingItemMin', () => {
    const baseProps = {
        title: 'title',
        disableOpen: false,
        section: 'section',
        updateSection: jest.fn(),
        describe: 'describe'
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SettingItemMin {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on disableOpen to true', () => {
        const props = {...baseProps, disableOpen: true};
        const wrapper = shallow(
            <SettingItemMin {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have called updateSection on handleUpdateSection with section', () => {
        const updateSection = jest.fn();
        const props = {...baseProps, updateSection};
        const wrapper = shallow(
            <SettingItemMin {...props}/>
        );

        wrapper.instance().handleUpdateSection({preventDefault: jest.fn()});
        expect(updateSection).toHaveBeenCalled();
        expect(updateSection).toHaveBeenCalledWith('section');
    });

    test('should have called updateSection on handleUpdateSection with empty string', () => {
        const updateSection = jest.fn();
        const props = {...baseProps, updateSection, section: ''};
        const wrapper = shallow(
            <SettingItemMin {...props}/>
        );

        wrapper.instance().handleUpdateSection({preventDefault: jest.fn()});
        expect(updateSection).toHaveBeenCalled();
        expect(updateSection).toHaveBeenCalledWith('');
    });
});
