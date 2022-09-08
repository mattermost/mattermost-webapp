// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {AlertCircleOutlineIcon} from '@mattermost/compass-icons/components';

import Tag from './tag';

const defaultProps = {
    size: 'xs',
    className: 'Tag test',
};

describe('components/widgets/tag/Tag', () => {
    test('should match the snapshot on show', () => {
        const wrapper = shallow(
            <Tag
                className={'test'}
                text={'Test text'}
            />,
        );
        expect(wrapper.props()).toEqual(expect.objectContaining(defaultProps));
        expect(wrapper.text()).toEqual('Test text');
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot with icon', () => {
        const wrapper = shallow(
            <Tag
                className={'test'}
                text={'Test text'}
                icon={'alert-circle-outline'}
            />,
        );
        expect(wrapper.props()).toEqual(expect.objectContaining(defaultProps));
        expect(wrapper.find(AlertCircleOutlineIcon).exists()).toEqual(true);
        expect(wrapper.text()).toContain('Test text');
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot with capitalized option', () => {
        const wrapper = shallow(
            <Tag
                className={'test'}
                text={'Test text'}
                capitalize={true}
            />,
        );
        expect(wrapper.props()).toEqual(expect.objectContaining({...defaultProps, capitalize: true}));
        expect(wrapper.text()).toEqual('Test text');
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot with size "sm"', () => {
        const wrapper = shallow(
            <Tag
                className={'test'}
                text={'Test text'}
                size={'sm'}
            />,
        );
        expect(wrapper.props()).toEqual(expect.objectContaining({...defaultProps, size: 'sm'}));
        expect(wrapper.text()).toEqual('Test text');
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot with "success" variant', () => {
        const wrapper = shallow(
            <Tag
                className={'test'}
                text={'Test text'}
                variant={'success'}
            />,
        );
        expect(wrapper.props()).toEqual(expect.objectContaining({...defaultProps, className: 'Tag success test'}));
        expect(wrapper.text()).toEqual('Test text');
        expect(wrapper).toMatchSnapshot();
    });

    test('should transform into a button if onClick provided', () => {
        const click = jest.fn();
        const wrapper = shallow(
            <Tag
                className={'test'}
                text={'Test text'}
                onClick={click}
            />,
        );
        expect(wrapper.props()).toEqual(expect.objectContaining({...defaultProps, onClick: click}));
        expect(wrapper.text()).toEqual('Test text');
        wrapper.simulate('click');
        expect(click).toBeCalled();
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot on hide', () => {
        const wrapper = shallow(
            <Tag
                show={false}
                text={'Test text'}
            />,
        );
        expect(wrapper).toMatchInlineSnapshot('""');
    });
});
