// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import CloseChannel from './close_channel';

describe('components/ChannelHeaderDropdown/MenuItem.CloseChannel', () => {
    const baseProps = {
        actions: {
            goToLastViewedChannel: jest.fn(),
        },
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<CloseChannel {...baseProps}/>);
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
        const wrapper = shallow(<CloseChannel {...props}/>);
        wrapper.find('button').simulate('click');
        expect(props.actions.goToLastViewedChannel).toHaveBeenCalled();
    });
});
