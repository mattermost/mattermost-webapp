// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import Constants from 'utils/constants';

import MarkdownImage from './markdown_image';
import SizeAwareImage from './size_aware_image';
import ViewImageModal from './view_image';

describe('components/MarkdownImage', () => {
    const baseProps = {
        imageMetadata: {
            format: 'png',
            height: 90,
            width: 1041,
            frame_count: 0,
        },
        alt: 'test image',
        className: 'markdown-inline-img',
        postId: 'post_id',
        imageIsLink: false,
        onImageLoaded: jest.fn(),
    };

    test('should match snapshot', () => {
        const props = {...baseProps, src: '/images/logo.png'};
        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for broken link', () => {
        const props = {...baseProps, imageMetadata: {}, src: 'brokenLink'};
        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should handle load failure properly', () => {
        const props = {...baseProps, imageMetadata: {}, src: 'brokenLink'};
        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );

        expect(wrapper.state('loadFailed')).toBe(false);

        wrapper.instance().handleLoadFail();

        expect(wrapper.state('loadFailed')).toBe(true);
    });

    test('should reset loadFailed state after image source is updated', () => {
        const props = {...baseProps, imageMetadata: {}, src: 'brokenLink'};
        const nextProps = {...baseProps, src: 'https://example.com/image.png'};
        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );

        wrapper.instance().setState({loadFailed: true});

        wrapper.setProps(nextProps);

        expect(wrapper.state('loadFailed')).toBe(false);
    });

    test('should render a link if the source is unsafe', () => {
        const props = {...baseProps, src: ''};
        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );
        expect(wrapper.find('img').props().alt).toBe(props.alt);
        expect(wrapper.find('img').props().className).toBe(props.className + ' broken-image');
        expect(wrapper).toMatchSnapshot();
    });

    test('should handle not loaded state properly', () => {
        const props = {...baseProps, src: 'https://example.com/image.png'};
        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );

        expect(wrapper.state('loaded')).toBe(false);

        const childrenNode = wrapper.props().children(props.src);

        // using a div as a workaround because shallow doesn't support react fragments
        const childrenWrapper = shallow(<div>{childrenNode}</div>);

        expect(childrenWrapper.find(SizeAwareImage)).toHaveLength(1);
        expect(childrenWrapper.find(SizeAwareImage).prop('className')).
            toEqual(`${props.className} markdown-inline-img--loading`);
    });

    test('should handle not loaded state properly in case of a header change system message', () => {
        const props = {...baseProps, src: 'https://example.com/image.png', postType: 'system_header_change'};
        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );

        expect(wrapper.state('loaded')).toBe(false);

        const childrenNode = wrapper.props().children(props.src);

        // using a div as a workaround because shallow doesn't support react fragments
        const childrenWrapper = shallow(<div>{childrenNode}</div>);

        expect(childrenWrapper.find(SizeAwareImage)).toHaveLength(1);
        expect(childrenWrapper.find(SizeAwareImage).prop('className')).
            toEqual(`${props.className} markdown-inline-img--scaled-down-loading`);
    });

    test('should set loaded state when img loads and call onImageLoaded prop', () => {
        const props = {...baseProps, src: 'https://example.com/image.png'};
        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );
        const dimensions = {
            height: props.imageMetadata.height,
            width: props.imageMetadata.width,
        };

        expect(wrapper.state('loaded')).toBe(false);

        wrapper.instance().handleImageLoaded(dimensions);

        expect(wrapper.state('loaded')).toBe(true);

        expect(props.onImageLoaded).toHaveBeenCalledTimes(1);
        expect(props.onImageLoaded).toHaveBeenCalledWith(dimensions);
    });

    it('should match snapshot for SizeAwareImage dimensions', () => {
        const props = {...baseProps,
            imageMetadata: {format: 'jpg', frame_count: 0, width: 100, height: 90},
            src: 'path/image',
        };
        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );

        wrapper.instance().setState({loaded: true});

        const childrenWrapper = wrapper.props().children('safeSrc');
        expect(childrenWrapper).toMatchSnapshot();
    });

    test('should render an image with preview modal if the source is safe', () => {
        const props = {...baseProps, src: 'https://example.com/image.png'};
        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );
        wrapper.instance().setState({loaded: true});

        const childrenNode = wrapper.props().children(props.src);

        // using a div as a workaround because shallow doesn't support react fragments
        const childrenWrapper = shallow(<div>{childrenNode}</div>);

        expect(childrenWrapper.find(SizeAwareImage)).toHaveLength(1);
        expect(childrenWrapper.find(SizeAwareImage).prop('className')).
            toEqual(`${props.className} markdown-inline-img--hover cursor--pointer a11y--active`);
        expect(childrenWrapper.find(ViewImageModal)).toHaveLength(1);
        expect(childrenWrapper).toMatchSnapshot();
    });

    test('should render an image with no preview if the source is safe and the image is a link', () => {
        const props = {...baseProps, src: 'https://example.com/image.png', imageIsLink: true};
        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );
        wrapper.instance().setState({loaded: true});

        const childrenNode = wrapper.props().children(props.src);

        // using a div as a workaround because shallow doesn't support react fragments
        const childrenWrapper = shallow(<div>{childrenNode}</div>);

        expect(childrenWrapper.find(SizeAwareImage)).toHaveLength(1);
        expect(childrenWrapper.find(SizeAwareImage).prop('className')).
            toEqual(`${props.className} markdown-inline-img--hover markdown-inline-img--no-border`);
        expect(childrenWrapper.find(ViewImageModal)).toHaveLength(0);
        expect(childrenWrapper).toMatchSnapshot();
    });

    test('should handle showModal state properly', () => {
        const props = {...baseProps, src: 'https://example.com/image.png'};
        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );
        wrapper.instance().showModal({preventDefault: () => {}});
        expect(wrapper.state('showModal')).toEqual(true);
    });

    test('should handle showModal state properly in case the image is a link', () => {
        const props = {...baseProps, src: 'https://example.com/image.png', imageIsLink: true};
        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );
        wrapper.instance().showModal();
        expect(wrapper.state('showModal')).toEqual(false);
    });

    test('should properly scale down the image in case of a header change system message', () => {
        const props = {...baseProps, src: 'https://example.com/image.png', postType: 'system_header_change'};
        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );
        wrapper.instance().setState({loaded: true});

        const childrenNode = wrapper.props().children(props.src);

        // using a div as a workaround because shallow doesn't support react fragments
        const childrenWrapper = shallow(<div>{childrenNode}</div>);

        expect(childrenWrapper.find(SizeAwareImage)).toHaveLength(1);
        expect(childrenWrapper.find(SizeAwareImage).prop('className')).
            toEqual(`${props.className} markdown-inline-img--hover cursor--pointer a11y--active markdown-inline-img--scaled-down`);
    });

    test('should render image with title, height, width', () => {
        const props = {
            alt: 'test image',
            title: 'test title',
            className: 'markdown-inline-img',
            postId: 'post_id',
            src: 'https://example.com/image.png',
            imageIsLink: false,
            height: 76,
            width: 50,
        };

        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );
        wrapper.instance().setState({loaded: true});

        const childrenNode = wrapper.props().children(props.src);

        // using a div as a workaround because shallow doesn't support react fragments
        const childrenWrapper = shallow(<div>{childrenNode}</div>);

        expect(childrenWrapper.find(SizeAwareImage)).toHaveLength(1);
        expect(childrenWrapper.find(SizeAwareImage).prop('className')).
            toEqual(`${props.className} markdown-inline-img--hover cursor--pointer a11y--active`);

        expect(childrenWrapper.find(SizeAwareImage).prop('width')).toEqual(50);
        expect(childrenWrapper.find(SizeAwareImage).prop('height')).toEqual(76);
        expect(childrenWrapper.find(SizeAwareImage).prop('title')).toEqual('test title');
    });

    test(`should render image with MarkdownImageExpand if it is taller than ${Constants.EXPANDABLE_INLINE_IMAGE_MIN_HEIGHT}px`, () => {
        const props = {
            alt: 'test image',
            title: 'test title',
            className: 'markdown-inline-img',
            postId: 'post_id',
            src: 'https://example.com/image.png',
            imageIsLink: false,
            height: 250,
            width: 50,
        };

        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );
        wrapper.instance().setState({loaded: true});
        const childrenNode = wrapper.props().children(props.src);

        // using a div as a workaround because shallow doesn't support react fragments
        const childrenWrapper = shallow(<div>{childrenNode}</div>);

        expect(childrenWrapper).toMatchSnapshot();
    });

    test('should provide image src as an alt text for MarkdownImageExpand if image has no own alt text', () => {
        const props = {
            alt: null,
            title: 'test title',
            className: 'markdown-inline-img',
            postId: 'post_id',
            src: 'https://example.com/image.png',
            imageIsLink: false,
            height: 250,
            width: 50,
        };

        const wrapper = shallow(
            <MarkdownImage {...props}/>,
        );
        wrapper.instance().setState({loaded: true});
        const childrenNode = wrapper.props().children(props.src);

        // using a div as a workaround because shallow doesn't support react fragments
        const childrenWrapper = shallow(<div>{childrenNode}</div>);

        expect(childrenWrapper).toMatchSnapshot();
    });
});
