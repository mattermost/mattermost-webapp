// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import ChannelInfoButton from './channel_info_button';

describe('components/ChannelHeaderMobile/ChannelInfoButton', () => {
    const baseProps = {
        channel: {
            id: 'channel_id',
            header: 'channel header',
        },
        isReadOnly: false,
        actions: {
            openModal: jest.fn(),
        },
    };

    test('should match snapshot, with channel header', () => {
        const wrapper = mountWithIntl(
            <ChannelInfoButton {...baseProps}/>
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
            <ChannelInfoButton {...props}/>
        );

        expect(wrapper).toMatchSnapshot();

        const ref = wrapper.ref('headerOverlay');
        ref.hide = jest.fn();
        wrapper.instance().showEditChannelHeaderModal();

        expect(ref.hide).toBeCalled();
        expect(props.actions.openModal).toBeCalled();
    });
});
