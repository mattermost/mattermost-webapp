// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import MarkdownImage from './markdown_image';
import SizeAwareImage from './size_aware_image';
import ViewImageModal from './view_image';

describe('components/MarkdownImage', () => {
    const baseProps = {
        imageMetadata: {
            format: 'png',
            height: 165,
            width: 1041,
            frame_count: 0,
        },
        alt: 'test image',
        className: 'markdown-inline-img',
        postId: 'post_id',
        imageIsLink: false,
    };

    test('should match snapshot', () => {
        const props = {...baseProps, src: '/images/logo.png'};
        const wrapper = shallow(
            <MarkdownImage {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for broken link', () => {
        const props = {...baseProps, imageMetadata: {}, src: 'brokenLink'};
        const wrapper = shallow(
            <MarkdownImage {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot for SizeAwareImage dimensions', () => {
        const props = {...baseProps,
            imageMetadata: {format: 'jpg', frame_count: 0, width: 100, height: 100},
            src: 'path/image',
        };
        const wrapper = shallow(
            <MarkdownImage {...props}/>
        );

        const childrenWrapper = wrapper.props().children('safeSrc');
        expect(childrenWrapper).toMatchSnapshot();
    });

    test('should render a link if the source is unsafe', () => {
        const props = {...baseProps, src: ''};
        const wrapper = shallow(
            <MarkdownImage {...props}/>
        );
        expect(wrapper.props().alt).toBe(props.alt);
        expect(wrapper).toMatchSnapshot();
    });

    test('should render an image with preview modal if the source is safe', () => {
        const props = {...baseProps, src: 'https://example.com/image.png'};
        const wrapper = shallow(
            <MarkdownImage {...props}/>
        );
        const childrenNode = wrapper.props().children(props.src);

        // using a div as a workaround because shallow doesn't support react fragments
        const childrenWrapper = shallow(<div>{childrenNode}</div>);

        expect(childrenWrapper.find(SizeAwareImage)).toHaveLength(1);
        expect(childrenWrapper.find(SizeAwareImage).first().prop('className')).
            toEqual(`${props.className} markdown-inline-img--hover cursor--pointer a11y--active`);
        expect(childrenWrapper.find(ViewImageModal)).toHaveLength(1);
        expect(childrenWrapper).toMatchSnapshot();
    });

    test('should render an image with no preview if the source is safe and the image is a link', () => {
        const props = {...baseProps, src: 'https://example.com/image.png', imageIsLink: true};
        const wrapper = shallow(
            <MarkdownImage {...props}/>
        );
        const childrenNode = wrapper.props().children(props.src);

        // using a div as a workaround because shallow doesn't support react fragments
        const childrenWrapper = shallow(<div>{childrenNode}</div>);

        expect(childrenWrapper.find(SizeAwareImage)).toHaveLength(1);
        expect(childrenWrapper.find(SizeAwareImage).first().prop('className')).
            toEqual(props.className);
        expect(childrenWrapper.find(ViewImageModal)).toHaveLength(0);
        expect(childrenWrapper).toMatchSnapshot();
    });

    test('should handle state properly', () => {
        const props = {...baseProps, src: 'https://example.com/image.png'};
        const wrapper = shallow(
            <MarkdownImage {...props}/>
        );
        wrapper.instance().showModal({preventDefault: () => {}});
        expect(wrapper.state('showModal')).toEqual(true);
    });

    test('should handle state properly in case the image is a link', () => {
        const props = {...baseProps, src: 'https://example.com/image.png', imageIsLink: true};
        const wrapper = shallow(
            <MarkdownImage {...props}/>
        );
        wrapper.instance().showModal();
        expect(wrapper.state('showModal')).toEqual(false);
    });
});
