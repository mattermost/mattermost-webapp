// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SettingPicture from 'components/setting_picture.jsx';

describe('components/SettingItemMin', () => {
    const baseProps = {
        clientError: '',
        serverError: '',
        src: 'http://localhost:8065/api/v4/users/src_id',
        loadingPicture: false,
        submitActive: false,
        onSubmit: () => {},  // eslint-disable-line no-empty-function
        title: 'Profile Picture',
        onFileChange: () => {},  // eslint-disable-line no-empty-function
        updateSection: () => {},  // eslint-disable-line no-empty-function
    };

    test('should match snapshot, profile picture on source', () => {
        const wrapper = shallow(
            <SettingPicture {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, profile picture on file', () => {
        const props = {...baseProps, file: {file: {}}, src: ''};
        const wrapper = shallow(
            <SettingPicture {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, team icon on source', () => {
        const props = {...baseProps, onRemove: jest.fn(), imageContext: 'team'};
        const wrapper = shallow(
            <SettingPicture {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, team icon on file', () => {
        const props = {...baseProps, onRemove: jest.fn(), imageContext: 'team', file: {file: {}}, src: ''};
        const wrapper = shallow(
            <SettingPicture {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
