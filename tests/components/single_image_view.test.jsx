// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import BrowserStore from 'stores/browser_store.jsx';

import SingleImageView from 'components/single_image_view/single_image_view.jsx';

jest.mock('stores/browser_store.jsx', () => ({
    setGlobalItem: jest.fn(),
}));

describe('components/SingleImageView', () => {
    const baseProps = {
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

    test('should match dimensions on computeImageDimensions', () => {
        const fileInfo = {
            id: 'file_info_id',
            post_id: 'post_id',
            name: 'name',
            extension: 'jpg',
            has_preview_image: true,
            width: 350,
            height: 200,
        };
        const props = {...baseProps, fileInfo};
        const wrapper = shallow(
            <SingleImageView {...props}/>
        );

        expect(wrapper.instance().computeImageDimensions()).toEqual({previewHeight: 200, previewWidth: 350});

        wrapper.setState({viewPortWidth: 100});
        expect(wrapper.instance().computeImageDimensions()).toEqual({previewHeight: 57.14285714285714, previewWidth: 100});

        wrapper.setState({viewPortWidth: 500});
        expect(wrapper.instance().computeImageDimensions()).toEqual({previewHeight: 200, previewWidth: 350});

        fileInfo.height = 600;
        wrapper.setProps({fileInfo});
        wrapper.setState({viewPortWidth: 500});
        expect(wrapper.instance().computeImageDimensions()).toEqual({previewHeight: 350, previewWidth: 204.16666666666669});
    });

    test('should call BrowserStore.setGlobalItem on toggleEmbedVisibility', () => {
        const wrapper = shallow(
            <SingleImageView {...baseProps}/>
        );

        wrapper.instance().toggleEmbedVisibility();
        expect(BrowserStore.setGlobalItem).toHaveBeenCalledTimes(1);
        expect(BrowserStore.setGlobalItem).toBeCalledWith('isVisible_post_id', false);
    });
});
