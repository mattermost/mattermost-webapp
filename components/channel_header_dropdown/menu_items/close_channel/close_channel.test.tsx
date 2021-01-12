// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';

import Menu from 'components/widgets/menu/menu';

import CloseChannel from './close_channel';

describe('components/ChannelHeaderDropdown/MenuItem.CloseChannel', () => {
    const baseProps = {
        isArchived: true,
        actions: {
            goToLastViewedChannel: jest.fn(),
        },
    };

    it('should match snapshot', () => {
        const wrapper: ShallowWrapper<any, any, CloseChannel> = shallow(<CloseChannel {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('shoud be hidden if the channel is not archived', () => {
        const props = {
            ...baseProps,
            isArchived: false,
        };
        const wrapper: ShallowWrapper<any, any, CloseChannel> = shallow(<CloseChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should runs goToLastViewedChannel function on click', () => {
        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                goToLastViewedChannel: jest.fn(),
            },
        };
        const wrapper: ShallowWrapper<any, any, CloseChannel> = shallow(<CloseChannel {...props}/>);
        wrapper.find(Menu.ItemAction).simulate('click');
        expect(props.actions.goToLastViewedChannel).toHaveBeenCalled();
    });
});
