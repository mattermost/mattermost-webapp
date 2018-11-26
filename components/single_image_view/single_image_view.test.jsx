// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SingleImageView from 'components/single_image_view/single_image_view.jsx';

describe('components/SingleImageView', () => {
    const baseProps = {
        postId: 'original_post_id',
        fileInfo: {
            id: 'file_info_id',
            post_id: 'post_id',
            name: 'name',
            extension: 'jpg',
            has_preview_image: true,
            width: 350,
            height: 200,
        },
        isRhsOpen: false,
        isEmbedVisible: true,
        actions: {
            toggleEmbedVisibility: () => null,
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SingleImageView {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();

        wrapper.setState({loaded: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, SVG image', () => {
        const fileInfo = {
            id: 'svg_file_info_id',
            post_id: 'post_id',
            name: 'name_svg',
            extension: 'svg',
        };
        const props = {...baseProps, fileInfo};
        const wrapper = shallow(
            <SingleImageView {...props}/>
        );

        wrapper.setState({viewPortWidth: 300});
        expect(wrapper).toMatchSnapshot();

        wrapper.setState({loaded: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should call setViewPortWidth on handleResize', () => {
        const wrapper = shallow(
            <SingleImageView {...baseProps}/>
        );

        const instance = wrapper.instance();
        instance.setViewPortWidth = jest.fn();

        instance.handleResize();
        expect(instance.setViewPortWidth).toHaveBeenCalledTimes(1);
    });

    test('should match state on setViewPortWidth', () => {
        const wrapper = shallow(
            <SingleImageView {...baseProps}/>
        );

        wrapper.setState({viewPortWidth: 300});
        const instance = wrapper.instance();
        instance.viewPort = {getBoundingClientRect: () => ({width: 500})};
        instance.setViewPortWidth();

        expect(wrapper.state('viewPortWidth')).toEqual(500);
    });

    test('should match state on handleImageClick', () => {
        const wrapper = shallow(
            <SingleImageView {...baseProps}/>
        );

        wrapper.setState({showPreviewModal: false});
        wrapper.instance().handleImageClick({preventDefault: jest.fn()});
        expect(wrapper.state('showPreviewModal')).toEqual(true);
    });

    test('should match state on showPreviewModal', () => {
        const wrapper = shallow(
            <SingleImageView {...baseProps}/>
        );

        wrapper.setState({showPreviewModal: true});
        wrapper.instance().showPreviewModal();
        expect(wrapper.state('showPreviewModal')).toEqual(false);
    });

    test('should call toggleEmbedVisibility with post id', () => {
        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                toggleEmbedVisibility: jest.fn(),
            },
        };

        const wrapper = shallow(
            <SingleImageView {...props}/>
        );

        wrapper.instance().toggleEmbedVisibility();
        expect(props.actions.toggleEmbedVisibility).toHaveBeenCalledTimes(1);
        expect(props.actions.toggleEmbedVisibility).toBeCalledWith('original_post_id');
    });
});
