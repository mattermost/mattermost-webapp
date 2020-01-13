// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {OverlayTrigger} from 'react-bootstrap';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

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

        const hide = jest.fn();

        const ref = wrapper.find(OverlayTrigger);
        ref.instance().hide = hide;
        wrapper.instance().hide();

        expect(hide).toBeCalled();
    });

    test('should match snapshot, without channel header', () => {
        const props = {...baseProps, channel: {id: 'channel_id'}};
        const wrapper = mountWithIntl(
            <ChannelInfoButton {...props}/>
        );

        expect(wrapper).toMatchSnapshot();

        const hide = jest.fn();

        const ref = wrapper.find(OverlayTrigger);
        ref.instance().hide = hide;
        wrapper.instance().showEditChannelHeaderModal();

        expect(hide).toBeCalled();
        expect(props.actions.openModal).toBeCalled();
    });
});
