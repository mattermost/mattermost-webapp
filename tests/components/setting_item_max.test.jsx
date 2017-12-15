// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Constants from 'utils/constants.jsx';

import SettingItemMax from 'components/setting_item_max.jsx';

describe('components/SettingItemMin', () => {
    const baseProps = {
        inputs: ['input_1'],
        client_error: '',
        server_error: '',
        infoPosition: 'bottom',
        section: 'section',
        updateSection: jest.fn(),
        setting: 'setting',
        submit: jest.fn(),
        saving: false,
        title: 'title',
        width: 'full'
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SettingItemMax {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, without submit', () => {
        const props = {...baseProps, submit: null};
        const wrapper = shallow(
            <SettingItemMax {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on client_error', () => {
        const props = {...baseProps, client_error: 'client_error'};
        const wrapper = shallow(
            <SettingItemMax {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on server_error', () => {
        const props = {...baseProps, server_error: 'server_error'};
        const wrapper = shallow(
            <SettingItemMax {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have called updateSection on handleUpdateSection with section', () => {
        const updateSection = jest.fn();
        const props = {...baseProps, updateSection};
        const wrapper = shallow(
            <SettingItemMax {...props}/>
        );

        wrapper.instance().handleUpdateSection({preventDefault: jest.fn()});
        expect(updateSection).toHaveBeenCalled();
        expect(updateSection).toHaveBeenCalledWith('section');
    });

    test('should have called updateSection on handleUpdateSection with empty string', () => {
        const updateSection = jest.fn();
        const props = {...baseProps, updateSection, section: ''};
        const wrapper = shallow(
            <SettingItemMax {...props}/>
        );

        wrapper.instance().handleUpdateSection({preventDefault: jest.fn()});
        expect(updateSection).toHaveBeenCalled();
        expect(updateSection).toHaveBeenCalledWith('');
    });

    test('should have called submit on handleSubmit with setting', () => {
        const submit = jest.fn();
        const props = {...baseProps, submit};
        const wrapper = shallow(
            <SettingItemMax {...props}/>
        );

        wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(submit).toHaveBeenCalled();
        expect(submit).toHaveBeenCalledWith('setting');
    });

    test('should have called submit on handleSubmit with empty string', () => {
        const submit = jest.fn();
        const props = {...baseProps, submit, setting: ''};
        const wrapper = shallow(
            <SettingItemMax {...props}/>
        );

        wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(submit).toHaveBeenCalled();
        expect(submit).toHaveBeenCalledWith();
    });

    it('should have called submit on handleSubmit onKeyDown ENTER', () => {
        const submit = jest.fn();
        const props = {...baseProps, submit};
        const wrapper = shallow(
            <SettingItemMax {...props}/>
        );
        const instance = wrapper.instance();
        instance.onKeyDown({preventDefault: jest.fn(), keyCode: Constants.KeyCodes.ENTER});
        expect(submit).toHaveBeenCalled();
        expect(submit).toHaveBeenCalledWith('setting');
    });
});
