// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {UploadStatuses} from 'utils/constants';
import UploadButton from 'components/admin_console/brand_image_setting/upload_button.jsx';

describe('components/admin_console/brand_image_setting/UploadButton', () => {
    const baseProps = {
        status: UploadStatuses.DEFAULT,
        primaryClass: 'btn btn-primary',
        disabled: false,
        onClick: () => {}, //eslint-disable-line no-empty-function
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <UploadButton {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();

        wrapper.setProps({status: UploadStatuses.LOADING});
        expect(wrapper).toMatchSnapshot();

        wrapper.setProps({status: UploadStatuses.COMPLETE});
        expect(wrapper).toMatchSnapshot();

        wrapper.setProps({disabled: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should have called props.onClick on button click', () => {
        const onClick = jest.fn();
        const props = {...baseProps, onClick};
        const wrapper = shallow(
            <UploadButton {...props}/>,
        );

        wrapper.find('button').first().simulate('click');
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
