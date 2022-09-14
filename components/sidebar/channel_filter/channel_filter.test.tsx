// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChannelFilter from 'components/sidebar/channel_filter/channel_filter';
import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

describe('components/sidebar/channel_filter', () => {
    const intl = {
        formatMessage: (message: {id: string; defaultMessage: string}) => {
            return message.defaultMessage;
        },
    } as any;

    const baseProps = {
        intl,
        unreadFilterEnabled: false,
        hasMultipleTeams: false,
        actions: {
            setUnreadFilterEnabled: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ChannelFilter {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot if the unread filter is enabled', () => {
        const props = {
            ...baseProps,
            unreadFilterEnabled: true,
        };

        const wrapper = shallowWithIntl(
            <ChannelFilter {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should enable the unread filter on toggle when it is disabled', () => {
        const wrapper = shallowWithIntl(
            <ChannelFilter {...baseProps}/>,
        );

        wrapper.instance().toggleUnreadFilter();
        expect(baseProps.actions.setUnreadFilterEnabled).toHaveBeenCalledWith(true);
    });

    test('should disable the unread filter on toggle when it is enabled', () => {
        const props = {
            ...baseProps,
            unreadFilterEnabled: true,
        };

        const wrapper = shallowWithIntl(
            <ChannelFilter {...props}/>,
        );

        wrapper.instance().toggleUnreadFilter();
        expect(baseProps.actions.setUnreadFilterEnabled).toHaveBeenCalledWith(false);
    });
});
