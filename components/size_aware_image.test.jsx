// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount, shallow} from 'enzyme';

import SizeAwareImage from 'components/size_aware_image';
import LoadingImagePreview from 'components/loading_image_preview';

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

        const src = wrapper.find('img').prop('src');
        expect(src.startsWith('data:image')).toBeTruthy();
    });

    test('should render a placeholder and has loader when showLoader is true', () => {
        const placeholder = 'data:image/png;base64,abc123';
        createPlaceholderImage.mockImplementation(() => placeholder);
        const props = {
            ...baseProps,
            showLoader: true,
        };

        const wrapper = shallow(<SizeAwareImage {...props}/>);
        expect(wrapper.find(LoadingImagePreview).exists()).toEqual(true);
        expect(wrapper.find('img').prop('src')).toEqual(placeholder);
        expect(wrapper).toMatchSnapshot();
    });

    test('should render the actual image after it is loaded', () => {
        const wrapper = mount(<SizeAwareImage {...baseProps}/>);
        wrapper.setState({loaded: true, error: false});

        const src = wrapper.find('img').prop('src');
        expect(src).toEqual(baseProps.src);
    });

    test('should render the actual image when first mounted without dimensions', () => {
        const props = {...baseProps};
        Reflect.deleteProperty(props, 'dimensions');

        const wrapper = mount(<SizeAwareImage {...props}/>);

        wrapper.setState({error: false});

        const src = wrapper.find('img').prop('src');
        expect(src).toEqual(baseProps.src);
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

    test('should call onHeightReceived on image is loaded', () => {
        const height = 123;
        loadImage.mockImplementation((src, onLoad) => {
            onLoad({height});

            return {};
        });

        const props = {...baseProps};
        shallow(<SizeAwareImage {...props}/>);

        expect(baseProps.onHeightReceived).toHaveBeenCalledWith(height);
    });

    test('should call onImageLoadFail when image load fails and should render empty/null', () => {
        const onImageLoadFail = jest.fn();
        const props = {...baseProps, onImageLoadFail};

        const wrapper = shallow(<SizeAwareImage {...props}/>);
        wrapper.instance().handleError();
        expect(props.onImageLoadFail).toHaveBeenCalled();

        expect(wrapper.find('img').exists()).toEqual(false);
        expect(wrapper.find(LoadingImagePreview).exists()).toEqual(false);
    });
});
