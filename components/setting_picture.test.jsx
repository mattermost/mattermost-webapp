// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import SettingPicture from 'components/setting_picture.jsx';

const helpText = (
    <FormattedMarkdownMessage
        id={'setting_picture.help.profile'}
        defaultMessage='Upload a picture in BMP, JPG or PNG format. Maximum file size: {max}'
        values={{max: 52428800}}
    />
);

describe('components/SettingItemMin', () => {
    const baseProps = {
        clientError: '',
        serverError: '',
        src: 'http://localhost:8065/api/v4/users/src_id',
        loadingPicture: false,
        submitActive: false,
        onSubmit: () => {}, // eslint-disable-line no-empty-function
        title: 'Profile Picture',
        onFileChange: () => {}, // eslint-disable-line no-empty-function
        updateSection: () => {}, // eslint-disable-line no-empty-function
        maxFileSize: 209715200,
        helpText: {helpText},
    };

    test('should match snapshot, profile picture on source', () => {
        const wrapper = shallow(
            <SettingPicture {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, profile picture on file', () => {
        const props = {...baseProps, file: {file: {}}, src: ''};
        const wrapper = shallow(
            <SettingPicture {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, user icon on source', () => {
        const props = {...baseProps, onSetDefault: jest.fn()};
        const wrapper = shallow(
            <SettingPicture {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, team icon on source', () => {
        const props = {...baseProps, onRemove: jest.fn(), imageContext: 'team'};
        const wrapper = shallow(
            <SettingPicture {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, team icon on file', () => {
        const props = {...baseProps, onRemove: jest.fn(), imageContext: 'team', file: {file: {}}, src: ''};
        const wrapper = shallow(
            <SettingPicture {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on loading picture', () => {
        const props = {...baseProps, loadingPicture: true};
        const wrapper = shallow(
            <SettingPicture {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with active Save button', () => {
        const props = {...baseProps, submitActive: true};
        const wrapper = shallow(
            <SettingPicture {...props}/>,
        );

        wrapper.setState({removeSrc: false});
        expect(wrapper).toMatchSnapshot();

        wrapper.setProps({submitActive: false});
        wrapper.setState({removeSrc: true});

        expect(wrapper).toMatchSnapshot();
    });

    test('should match state and call props.updateSection on handleCancel', () => {
        const props = {...baseProps, updateSection: jest.fn()};
        const wrapper = shallow(
            <SettingPicture {...props}/>,
        );
        wrapper.setState({removeSrc: true});
        const evt = {preventDefault: jest.fn()};

        wrapper.instance().handleCancel(evt);
        expect(props.updateSection).toHaveBeenCalledTimes(1);
        expect(props.updateSection).toHaveBeenCalledWith(evt);

        wrapper.update();
        expect(wrapper.state('removeSrc')).toEqual(false);
    });

    test('should call props.onRemove on handleSave', () => {
        const props = {...baseProps, onRemove: jest.fn()};
        const wrapper = shallow(
            <SettingPicture {...props}/>,
        );
        wrapper.setState({removeSrc: true});
        const evt = {preventDefault: jest.fn()};

        wrapper.instance().handleSave(evt);
        expect(props.onRemove).toHaveBeenCalledTimes(1);
    });

    test('should call props.onSetDefault on handleSave', () => {
        const props = {...baseProps, onSetDefault: jest.fn()};
        const wrapper = shallow(
            <SettingPicture {...props}/>,
        );
        wrapper.setState({setDefaultSrc: true});
        const evt = {preventDefault: jest.fn()};

        wrapper.instance().handleSave(evt);
        expect(props.onSetDefault).toHaveBeenCalledTimes(1);
    });

    test('should match state and call props.onSubmit on handleSave', () => {
        const props = {...baseProps, onSubmit: jest.fn()};
        const wrapper = shallow(
            <SettingPicture {...props}/>,
        );
        wrapper.setState({removeSrc: false});
        const evt = {preventDefault: jest.fn()};

        wrapper.instance().handleSave(evt);
        expect(props.onSubmit).toHaveBeenCalledTimes(1);

        wrapper.update();
        expect(wrapper.state('removeSrc')).toEqual(false);
    });

    test('should match state on handleRemoveSrc', () => {
        const props = {...baseProps, onSubmit: jest.fn()};
        const wrapper = shallow(
            <SettingPicture {...props}/>,
        );
        wrapper.setState({removeSrc: false});
        const evt = {preventDefault: jest.fn()};
        wrapper.instance().handleRemoveSrc(evt);
        wrapper.update();
        expect(wrapper.state('removeSrc')).toEqual(true);
    });

    test('should match state and call props.onFileChange on handleFileChange', () => {
        const props = {...baseProps, onFileChange: jest.fn()};
        const wrapper = shallow(
            <SettingPicture {...props}/>,
        );
        wrapper.setState({removeSrc: true});
        const evt = {preventDefault: jest.fn()};

        wrapper.instance().handleFileChange(evt);
        expect(props.onFileChange).toHaveBeenCalledTimes(1);
        expect(props.onFileChange).toHaveBeenCalledWith(evt);

        wrapper.update();
        expect(wrapper.state('removeSrc')).toEqual(false);
    });
});
