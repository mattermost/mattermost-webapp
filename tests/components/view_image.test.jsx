// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {shallow} from 'enzyme';

import Constants from 'utils/constants.jsx';
import ViewImageModal from 'components/view_image';
import AudioVideoPreview from 'components/audio_video_preview';
import CodePreview from 'components/code_preview';
import FileInfoPreview from 'components/file_info_preview';
import ImagePreview from 'components/image_preview';
import LoadingImagePreview from 'components/loading_image_preview';
import ViewImagePopoverBar from 'components/view_image_popover_bar';

describe('components/ViewImageModal', () => {
    const onModalDismissed = jest.fn();
    const requiredProps = {
        show: true,
        fileInfos: [{id: 'file_id', extension: 'jpg'}],
        startIndex: 0,
        onModalDismissed,
    };

    test('should match snapshot, modal not shown', () => {
        const show = false;
        const props = {...requiredProps, show};
        const wrapper = shallow(<ViewImageModal {...props}/>);

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).prop('show')).toBe(false);
    });

    test('should match snapshot, loading', () => {
        const wrapper = shallow(<ViewImageModal {...requiredProps}/>);

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(LoadingImagePreview).exists()).toBe(true);
        expect(wrapper.find(Modal).prop('show')).toBe(true);
    });

    test('should match snapshot, loaded with ImagePreview', () => {
        const wrapper = shallow(<ViewImageModal {...requiredProps}/>);

        wrapper.setState({loaded: [true]});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(LoadingImagePreview).exists()).toBe(false);
        expect(wrapper.find(ImagePreview).exists()).toBe(true);
    });

    test('should match snapshot, loaded with AudioVideoPreview - movie file', () => {
        const fileInfos = [{id: 'file_id', extension: 'mov'}];
        const props = {...requiredProps, fileInfos};
        const wrapper = shallow(<ViewImageModal {...props}/>);

        wrapper.setState({loaded: [true]});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(LoadingImagePreview).exists()).toBe(false);
        expect(wrapper.find(AudioVideoPreview).exists()).toBe(true);
    });

    test('should match snapshot, loaded with AudioVideoPreview - movie file', () => {
        const fileInfos = [{id: 'file_id', extension: 'm4a'}];
        const props = {...requiredProps, fileInfos};
        const wrapper = shallow(<ViewImageModal {...props}/>);

        wrapper.setState({loaded: [true]});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(LoadingImagePreview).exists()).toBe(false);
        expect(wrapper.find(AudioVideoPreview).exists()).toBe(true);
    });

    test('should match snapshot, loaded with CodePreview', () => {
        const fileInfos = [{id: 'file_id', extension: 'js'}];
        const props = {...requiredProps, fileInfos};
        const wrapper = shallow(<ViewImageModal {...props}/>);

        wrapper.setState({loaded: [true]});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(LoadingImagePreview).exists()).toBe(false);
        expect(wrapper.find(CodePreview).exists()).toBe(true);
    });

    test('should match snapshot, loaded with FileInfoPreview - other file type', () => {
        const fileInfos = [{id: 'file_id', extension: 'other'}];
        const props = {...requiredProps, fileInfos};
        const wrapper = shallow(<ViewImageModal {...props}/>);

        wrapper.setState({loaded: [true]});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(LoadingImagePreview).exists()).toBe(false);
        expect(wrapper.find(FileInfoPreview).exists()).toBe(true);
    });

    test('should match snapshot, loaded with left and right arrows', () => {
        const fileInfos = [
            {id: 'file_id_1', extension: 'gif'},
            {id: 'file_id_2', extension: 'wma'},
            {id: 'file_id_3', extension: 'mp4'},
        ];
        const props = {...requiredProps, fileInfos};
        const wrapper = shallow(<ViewImageModal {...props}/>);

        wrapper.setState({loaded: [true, true, true], showFooter: false});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#previewArrowLeft').exists()).toBe(true);
        expect(wrapper.find('#previewArrowRight').exists()).toBe(true);

        wrapper.find('#previewArrowRight').simulate('click', {stopPropagation: jest.fn()});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.state('imageIndex')).toBe(1);
        wrapper.find('#previewArrowRight').simulate('click', {stopPropagation: jest.fn()});
        expect(wrapper.state('imageIndex')).toBe(2);

        wrapper.find('#previewArrowLeft').simulate('click', {stopPropagation: jest.fn()});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.state('imageIndex')).toBe(1);
        wrapper.find('#previewArrowLeft').simulate('click', {stopPropagation: jest.fn()});
        expect(wrapper.state('imageIndex')).toBe(0);
    });

    test('should match snapshot, loaded with footer', () => {
        const fileInfos = [
            {id: 'file_id_1', extension: 'gif'},
            {id: 'file_id_2', extension: 'wma'},
            {id: 'file_id_3', extension: 'mp4'},
        ];
        const props = {...requiredProps, fileInfos};
        const wrapper = shallow(<ViewImageModal {...props}/>);

        wrapper.setState({loaded: [true, true, true], showFooter: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, loaded with ViewImagePopoverBar', () => {
        const wrapper = shallow(<ViewImageModal {...requiredProps}/>);

        wrapper.setState({loaded: [true]});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(ViewImagePopoverBar).prop('show')).toBe(false);

        wrapper.setState({showFooter: true});
        expect(wrapper.find(ViewImagePopoverBar).prop('show')).toBe(true);
    });

    test('should go to next or previous upon key press of right or left, respectively', () => {
        const fileInfos = [
            {id: 'file_id_1', extension: 'gif'},
            {id: 'file_id_2', extension: 'wma'},
            {id: 'file_id_3', extension: 'mp4'},
        ];
        const props = {...requiredProps, fileInfos};
        const wrapper = shallow(<ViewImageModal {...props}/>);

        wrapper.setState({loaded: [true, true, true]});

        let evt = {keyCode: Constants.KeyCodes.RIGHT};

        wrapper.instance().handleKeyPress(evt);
        expect(wrapper.state('imageIndex')).toBe(1);
        wrapper.instance().handleKeyPress(evt);
        expect(wrapper.state('imageIndex')).toBe(2);

        evt = {keyCode: Constants.KeyCodes.LEFT};
        wrapper.instance().handleKeyPress(evt);
        expect(wrapper.state('imageIndex')).toBe(1);
        wrapper.instance().handleKeyPress(evt);
        expect(wrapper.state('imageIndex')).toBe(0);
    });

    test('should handle onMouseEnter and onMouseLeave', () => {
        const wrapper = shallow(<ViewImageModal {...requiredProps}/>);
        wrapper.setState({loaded: [true]});

        wrapper.instance().onMouseEnterImage();
        expect(wrapper.state('showFooter')).toBe(true);

        wrapper.instance().onMouseLeaveImage();
        expect(wrapper.state('showFooter')).toBe(false);
    });

    test('should have called onModalDismissed', () => {
        const newOnModalDismissed = jest.fn();
        const props = {...requiredProps, onModalDismissed: newOnModalDismissed};
        const wrapper = shallow(<ViewImageModal {...props}/>);
        wrapper.setState({
            loaded: [true],
            showFooter: true,
        });
        wrapper.instance().handleGetPublicLink();

        expect(newOnModalDismissed).toHaveBeenCalledTimes(1);
    });

    test('should match snapshot on onModalShown and onModalHidden', () => {
        const fileInfos = [
            {id: 'file_id_1', extension: 'gif'},
            {id: 'file_id_2', extension: 'wma'},
            {id: 'file_id_3', extension: 'mp4'},
        ];
        const props = {...requiredProps, fileInfos};
        const wrapper = shallow(<ViewImageModal {...props}/>);
        const nextProps = {
            startIndex: 1,
        };
        wrapper.setState({loaded: [true]});

        wrapper.instance().onModalHidden();
        expect(wrapper).toMatchSnapshot();
        wrapper.instance().onModalShown(nextProps);
        expect(wrapper).toMatchSnapshot();
    });

    test('should have called loadImage', () => {
        const fileInfos = [
            {id: 'file_id_1', extension: 'gif'},
            {id: 'file_id_2', extension: 'wma'},
            {id: 'file_id_3', extension: 'mp4'},
        ];
        const props = {...requiredProps, fileInfos};
        const wrapper = shallow(<ViewImageModal {...props}/>);

        let index = 1;
        wrapper.setState({loaded: [true, false, false]});
        wrapper.instance().loadImage(index);

        expect(wrapper.state('loaded')[index]).toBe(true);

        index = 2;
        wrapper.instance().loadImage(index);
        expect(wrapper.state('loaded')[index]).toBe(true);
    });

    test('should handle handleImageLoaded', () => {
        const fileInfos = [
            {id: 'file_id_1', extension: 'gif'},
            {id: 'file_id_2', extension: 'wma'},
            {id: 'file_id_3', extension: 'mp4'},
        ];
        const props = {...requiredProps, fileInfos};
        const wrapper = shallow(<ViewImageModal {...props}/>);

        let index = 1;
        wrapper.setState({loaded: [true, false, false]});
        wrapper.instance().handleImageLoaded(index);

        expect(wrapper.state('loaded')[index]).toBe(true);

        index = 2;
        wrapper.instance().handleImageLoaded(index);
        expect(wrapper.state('loaded')[index]).toBe(true);
    });

    test('should handle handleImageProgress', () => {
        const fileInfos = [
            {id: 'file_id_1', extension: 'gif'},
            {id: 'file_id_2', extension: 'wma'},
            {id: 'file_id_3', extension: 'mp4'},
        ];
        const props = {...requiredProps, fileInfos};
        const wrapper = shallow(<ViewImageModal {...props}/>);

        const index = 1;
        let completedPercentage = 30;
        wrapper.setState({loaded: [true, false, false]});
        wrapper.instance().handleImageProgress(index, completedPercentage);

        expect(wrapper.state('progress')[index]).toBe(completedPercentage);

        completedPercentage = 70;
        wrapper.instance().handleImageProgress(index, completedPercentage);

        expect(wrapper.state('progress')[index]).toBe(completedPercentage);
    });

    test('should pass componentWillReceiveProps', () => {
        let nextProps = {
            show: false,
        };
        const wrapper = shallow(<ViewImageModal {...requiredProps}/>);
        expect(wrapper.find(Modal).prop('show')).toBe(true);
        wrapper.setProps(nextProps);
        expect(wrapper.find(Modal).prop('show')).toBe(false);

        expect(wrapper.state('loaded').length).toBe(1);
        expect(wrapper.state('progress').length).toBe(1);
        nextProps = {
            fileInfos: [
                {id: 'file_id_1', extension: 'gif'},
                {id: 'file_id_2', extension: 'wma'},
                {id: 'file_id_3', extension: 'mp4'},
            ],
        };
        wrapper.setProps(nextProps);
        expect(wrapper.state('loaded').length).toBe(3);
        expect(wrapper.state('progress').length).toBe(3);
    });
});
