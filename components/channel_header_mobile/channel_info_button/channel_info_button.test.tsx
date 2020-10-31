// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Channel} from 'mattermost-redux/types/channels';
import React from 'react';

import {OverlayTrigger as BaseOverlayTrigger} from 'react-bootstrap';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import NavbarInfoButton, {NavbarInfoButtonProps} from './channel_info_button';

interface MMOverlayTrigger extends BaseOverlayTrigger {
    hide: () => void;
}

describe('components/ChannelHeaderMobile/NavbarInfoButton', () => {
    const baseProps: NavbarInfoButtonProps = {
        channel: {
            id: 'channel_id',
            header: 'channel header',
        } as Channel,
        isReadOnly: false,
        isRHSOpen: false,
        actions: {
            openModal: jest.fn(),
        },
    };

    test('should match snapshot, with channel header', () => {
        const wrapper = mountWithIntl(
            <NavbarInfoButton {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();

        const hide = jest.fn();

        const ref = wrapper.find(BaseOverlayTrigger);
        const componentInstance = wrapper.instance() as NavbarInfoButton;
        (ref.instance() as MMOverlayTrigger).hide = hide;
        componentInstance.hide();

        expect(hide).toBeCalled();
    });

    test('should match snapshot, without channel header', () => {
        const props = {...baseProps, channel: {id: 'channel_id'} as Channel};
        const wrapper = mountWithIntl(
            <NavbarInfoButton {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();

        const hide = jest.fn();

        const componentInstance = wrapper.instance() as NavbarInfoButton;
        componentInstance.hide = hide;
        componentInstance.showEditChannelHeaderModal();

        expect(hide).toBeCalled();
        expect(props.actions.openModal).toBeCalled();
    });

    test('should hide when channel changes or RHS is opened', () => {
        const wrapper = mountWithIntl(
            <NavbarInfoButton {...baseProps}/>,
        );

        const hide = jest.fn();

        const componentInstance = wrapper.instance() as NavbarInfoButton;
        componentInstance.hide = hide;

        wrapper.setProps({isRHSOpen: false});
        wrapper.setProps({channel: {id: 'channel_id'}});
        expect(hide).not.toBeCalled();

        wrapper.setProps({channel: {id: 'channel_id_2'}});
        expect(hide).toHaveBeenCalledTimes(1);

        wrapper.setProps({isRHSOpen: true});
        expect(hide).toHaveBeenCalledTimes(2);
    });
});
