// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import MarkdownImage from 'components/markdown_image';

describe('components/MarkdownImage', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <MarkdownImage
                src={'https://something.com/image.png'}
                dimensions={{
                    width: '100',
                    height: '200',
                }}
                onHeightReceived={jest.fn()}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call onHeightReceived', () => {
        const onHeightReceived = jest.fn();
        const wrapper = shallow(
            <MarkdownImage
                src={'https://something.com/image.png'}
                onHeightReceived={onHeightReceived}
            />
        );
        const instance = wrapper.instance();

        instance.refs = {
            image: {
                height: 100,
            },
        };
        wrapper.find('img').prop('onLoad')();
        expect(onHeightReceived).toHaveBeenCalledWith(100);
    });
});
