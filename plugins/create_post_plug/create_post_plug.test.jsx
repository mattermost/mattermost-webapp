// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import CreatePostPlug from './create_post_plug.jsx';

describe('plugins/CreatePostPlug', () => {
    const testPlug = {
        id: 'someid',
        pluginId: 'pluginid',
        icon: <i className='fa fa-anchor'/>,
        action: jest.fn,
        dropdownText: 'some dropdown text',
        tooltipText: 'some tooltip text',
    };

    test('should match snapshot with no extended component', () => {
        const wrapper = shallow(
            <CreatePostPlug
                components={[]}
                channel={{}}
                channelMember={{}}
                theme={{}}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with one extended component', () => {
        const wrapper = shallow(
            <CreatePostPlug
                components={[testPlug]}
                channel={{}}
                channelMember={{}}
                theme={{}}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with two extended components', () => {
        const wrapper = shallow(
            <CreatePostPlug
                components={[testPlug, {...testPlug, id: 'someid2'}]}
                channel={{}}
                channelMember={{}}
                theme={{}}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
