// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount, shallow} from 'enzyme';

import SizeAwareImage from 'components/size_aware_image';
import LoadingImagePreview from 'components/loading_image_preview';

jest.mock('utils/image_utils');

import {loadImage} from 'utils/image_utils';

describe('components/SizeAwareImage', () => {
    const baseProps = {
        dimensions: {
            height: 200,
            width: 300,
        },
        onImageLoaded: jest.fn(),
        onImageLoadFail: jest.fn(),
        src: 'https://example.com/image.png',
    };

    loadImage.mockReturnValue(() => ({}));

    test('should render an svg when first mounted with dimensions and div display set to position absolute', () => {
        const wrapper = mount(<SizeAwareImage {...baseProps}/>);

        const viewBox = wrapper.find('svg').prop('viewBox');
        expect(viewBox).toEqual('0 0 300 200');
        const style = wrapper.find('.file-preview__button').prop('style');
        expect(style).toHaveProperty('position', 'absolute');
        expect(style).toHaveProperty('visibility', 'hidden');
    });

    test('img should have inherited class name from prop', () => {
        const wrapper = mount(<SizeAwareImage {...{...baseProps, className: 'imgClass'}}/>);

        const className = wrapper.find('img').prop('className');
        expect(className).toEqual('imgClass');
    });

    test('should render a placeholder and has loader when showLoader is true', () => {
        const props = {
            ...baseProps,
            showLoader: true,
        };

        const wrapper = shallow(<SizeAwareImage {...props}/>);
        expect(wrapper.find(LoadingImagePreview).exists()).toEqual(true);
        expect(wrapper).toMatchSnapshot();
    });

    test('should not have position absolute on button when image is in loaded state', () => {
        const wrapper = mount(<SizeAwareImage {...baseProps}/>);
        wrapper.setState({loaded: true, error: false});

        const style = wrapper.find('.file-preview__button').prop('style');
        expect(style).not.toHaveProperty('position', 'absolute');
    });

    test('should render the actual image when first mounted without dimensions', () => {
        const props = {...baseProps};
        Reflect.deleteProperty(props, 'dimensions');

        const wrapper = mount(<SizeAwareImage {...props}/>);

        wrapper.setState({error: false});

        const src = wrapper.find('img').prop('src');
        expect(src).toEqual(baseProps.src);
    });

    test('should set loaded state when img loads and call onImageLoaded prop', () => {
        const height = 123;
        const width = 1234;

        const wrapper = shallow(<SizeAwareImage {...baseProps}/>);

        wrapper.find('img').prop('onLoad')({target: {naturalHeight: height, naturalWidth: width}});
        expect(wrapper.state('loaded')).toBe(true);
        expect(baseProps.onImageLoaded).toHaveBeenCalledWith({height, width});
    });

    test('should call onImageLoadFail when image load fails and should have svg', () => {
        const wrapper = mount(<SizeAwareImage {...baseProps}/>);

        wrapper.find('img').prop('onError')();

        expect(wrapper.state('error')).toBe(true);
        expect(wrapper.find('svg').exists()).toEqual(true);
        expect(wrapper.find(LoadingImagePreview).exists()).toEqual(false);
    });
});
