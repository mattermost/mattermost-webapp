// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount, shallow} from 'enzyme';

import SizeAwareImage from 'components/size_aware_image';

jest.mock('utils/image_utils');

import {createPlaceholderImage, loadImage} from 'utils/image_utils';

describe('components/SizeAwareImage', () => {
    const baseProps = {
        dimensions: {
            height: 200,
            width: 300,
        },
        onHeightReceived: jest.fn(),
        src: 'https://example.com/image.png',
    };

    loadImage.mockReturnValue(() => ({}));

    test('should render a placeholder when first mounted with dimensions', () => {
        createPlaceholderImage.mockImplementation(() => 'data:image/png;base64,abc123');

        const wrapper = mount(<SizeAwareImage {...baseProps}/>);

        const img = wrapper.getDOMNode();
        expect(img.src.startsWith('data:image')).toBeTruthy();
    });

    test('should render the actual image after it is loaded', () => {
        const wrapper = mount(<SizeAwareImage {...baseProps}/>);
        wrapper.setState({loaded: true});

        const img = wrapper.getDOMNode();
        expect(img.src).toEqual(baseProps.src);
    });

    test('should render the actual image when first mounted without dimensions', () => {
        const props = {...baseProps};
        Reflect.deleteProperty(props, 'dimensions');

        const wrapper = mount(<SizeAwareImage {...props}/>);

        const img = wrapper.getDOMNode();
        expect(img.src).toEqual(baseProps.src);
    });

    test('should load image when mounted and when src changes', () => {
        const wrapper = shallow(<SizeAwareImage {...baseProps}/>);

        expect(loadImage).toHaveBeenCalledTimes(1);
        expect(loadImage.mock.calls[0][0]).toEqual(baseProps.src);

        const newSrc = 'https://example.com/new_image.png';
        wrapper.setProps({src: newSrc});

        expect(loadImage).toHaveBeenCalledTimes(2);
        expect(loadImage.mock.calls[1][0]).toEqual(newSrc);
    });

    test('should call onHeightReceived on load when dimensions are needed', () => {
        const height = 123;
        loadImage.mockImplementation((src, onLoad) => {
            onLoad({height});

            return {};
        });

        const props = {...baseProps};
        Reflect.deleteProperty(props, 'dimensions');

        shallow(<SizeAwareImage {...props}/>);

        expect(baseProps.onHeightReceived).toHaveBeenCalledWith(height);
    });

    test('should not call onHeightReceived when dimensions are provided', () => {
        loadImage.mockImplementation((src, onLoad) => {
            onLoad({height: 100});

            return {};
        });

        shallow(<SizeAwareImage {...baseProps}/>);

        expect(baseProps.onHeightReceived).not.toHaveBeenCalled();
    });
});
