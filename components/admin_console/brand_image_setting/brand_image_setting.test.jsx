// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {uploadBrandImage, deleteBrandImage} from 'actions/admin_actions.jsx';

import BrandImageSetting from './brand_image_setting.jsx';

jest.mock('actions/admin_actions.jsx', () => ({
    ...jest.requireActual('actions/admin_actions.jsx'),
    uploadBrandImage: jest.fn(),
    deleteBrandImage: jest.fn(),
}));

describe('components/admin_console/brand_image_setting', () => {
    const baseProps = {
        disabled: false,
        setSaveNeeded: jest.fn(),
        registerSaveAction: jest.fn(),
        unRegisterSaveAction: jest.fn(),
    };

    test('should have called deleteBrandImage or uploadBrandImage on save depending on component state', () => {
        const wrapper = shallow(
            <BrandImageSetting {...baseProps}/>,
        );

        const instance = wrapper.instance();

        wrapper.setState({deleteBrandImage: false, brandImage: 'brand_image_file'});
        instance.handleSave();
        expect(deleteBrandImage).toHaveBeenCalledTimes(0);
        expect(uploadBrandImage).toHaveBeenCalledTimes(1);

        wrapper.setState({deleteBrandImage: true, brandImage: null});
        instance.handleSave();
        expect(deleteBrandImage).toHaveBeenCalledTimes(1);
        expect(uploadBrandImage).toHaveBeenCalledTimes(1);
    });
});
