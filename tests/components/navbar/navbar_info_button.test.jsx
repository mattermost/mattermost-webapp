// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import NavbarInfoButton from 'components/navbar/navbar_info_button.jsx';

describe('components/navbar/NavbarInfoButton', () => {
    const baseProps = {
        channel: {
            id: 'channel_id',
            header: 'channel header',
        },
        showEditChannelHeaderModal: jest.fn(),
    };

    test('should match snapshot, with channel header', () => {
        const wrapper = mountWithIntl(
            <NavbarInfoButton {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();

        const ref = wrapper.ref('headerOverlay');
        ref.hide = jest.fn();
        wrapper.instance().hide();
        expect(ref.hide).toBeCalled();
    });

    test('should match snapshot, without channel header', () => {
        const props = {...baseProps, channel: {id: 'channel_id'}};
        const wrapper = mountWithIntl(
            <NavbarInfoButton {...props}/>
        );

        expect(wrapper).toMatchSnapshot();

        const ref = wrapper.ref('headerOverlay');
        ref.hide = jest.fn();
        wrapper.instance().showEditChannelHeaderModal();

        expect(ref.hide).toBeCalled();
        expect(props.showEditChannelHeaderModal).toBeCalled();
    });
});
