// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Badge from './badge';

describe('components/widgets/badges/Badge', () => {
    test('should match the snapshot on show', () => {
        const wrapper = shallow(
            <Badge className={'test'}>{'Test text'}</Badge>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should transform into a button if onClick provided', () => {
        const click = jest.fn();
        const wrapper = shallow(
            <Badge onClick={click}>{'Test text'}</Badge>,
        );
        wrapper.find('button').simulate('click');
        expect(click).toBeCalled();
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot on hide', () => {
        const wrapper = shallow(
            <Badge show={false}>{'Test text'}</Badge>,
        );
        expect(wrapper).toMatchInlineSnapshot('""');
    });
});
