// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import FilePreviewModal from 'components/file_preview_modal/file_preview_modal';

import Constants from 'utils/constants';
import {generateId} from 'utils/utils';

describe('components/FilePreviewModal', () => {
    const baseProps = {
        fileInfos: [{id: 'file_id', extension: 'jpg'}],
        startIndex: 0,
        canDownloadFiles: true,
        enablePublicLink: true,
        post: {},
        onExited: jest.fn(),
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<FilePreviewModal {...baseProps}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, loaded with image', () => {
        const wrapper = shallow(<FilePreviewModal {...baseProps}/>);

        wrapper.setState({loaded: [true]});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, loaded with .mov file', () => {
        const fileInfos = [{id: 'file_id', extension: 'mov'}];
        const props = {...baseProps, fileInfos};
        const wrapper = shallow(<FilePreviewModal {...props}/>);

        wrapper.setState({loaded: [true]});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, loaded with .m4a file', () => {
        const fileInfos = [{id: 'file_id', extension: 'm4a'}];
        const props = {...baseProps, fileInfos};
        const wrapper = shallow(<FilePreviewModal {...props}/>);

        wrapper.setState({loaded: [true]});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, loaded with .js file', () => {
        const fileInfos = [{id: 'file_id', extension: 'js'}];
        const props = {...baseProps, fileInfos};
        const wrapper = shallow(<FilePreviewModal {...props}/>);

        wrapper.setState({loaded: [true]});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, loaded with other file', () => {
        const fileInfos = [{id: 'file_id', extension: 'other'}];
        const props = {...baseProps, fileInfos};
        const wrapper = shallow(<FilePreviewModal {...props}/>);

        wrapper.setState({loaded: [true]});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, loaded with footer', () => {
        const fileInfos = [
            {id: 'file_id_1', extension: 'gif'},
            {id: 'file_id_2', extension: 'wma'},
            {id: 'file_id_3', extension: 'mp4'},
        ];
        const props = {...baseProps, fileInfos};
        const wrapper = shallow(<FilePreviewModal {...props}/>);

        wrapper.setState({loaded: [true, true, true]});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, loaded', () => {
        const wrapper = shallow(<FilePreviewModal {...baseProps}/>);

        wrapper.setState({loaded: [true]});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, loaded and showing footer', () => {
        const wrapper = shallow(<FilePreviewModal {...baseProps}/>);

        wrapper.setState({loaded: [true]});
        expect(wrapper).toMatchSnapshot();
    });

    test('should go to next or previous upon key press of right or left, respectively', () => {
        const fileInfos = [
            {id: 'file_id_1', extension: 'gif'},
            {id: 'file_id_2', extension: 'wma'},
            {id: 'file_id_3', extension: 'mp4'},
        ];
        const props = {...baseProps, fileInfos};
        const wrapper = shallow(<FilePreviewModal {...props}/>);

        wrapper.setState({loaded: [true, true, true]});

        let evt = {key: Constants.KeyCodes.RIGHT[0]};

        wrapper.instance().handleKeyPress(evt);
        expect(wrapper.state('imageIndex')).toBe(1);
        wrapper.instance().handleKeyPress(evt);
        expect(wrapper.state('imageIndex')).toBe(2);

        evt = {key: Constants.KeyCodes.LEFT[0]};
        wrapper.instance().handleKeyPress(evt);
        expect(wrapper.state('imageIndex')).toBe(1);
        wrapper.instance().handleKeyPress(evt);
        expect(wrapper.state('imageIndex')).toBe(0);
    });

    test('should handle onMouseEnter and onMouseLeave', () => {
        const wrapper = shallow(<FilePreviewModal {...baseProps}/>);
        wrapper.setState({loaded: [true]});

        wrapper.instance().onMouseEnterImage();
        expect(wrapper.state('showCloseBtn')).toBe(true);

        wrapper.instance().onMouseLeaveImage();
        expect(wrapper.state('showCloseBtn')).toBe(false);
    });

    test('should handle on modal close', () => {
        const wrapper = shallow(<FilePreviewModal {...baseProps}/>);
        wrapper.setState({
            loaded: [true],
        });

        wrapper.instance().handleModalClose();
        expect(wrapper.state('show')).toBe(false);
    });

    test('should match snapshot for external file', () => {
        const fileInfos = [
            {extension: 'png'},
        ];
        const props = {...baseProps, fileInfos};
        const wrapper = shallow(<FilePreviewModal {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should have called loadImage', () => {
        const fileInfos = [
            {id: 'file_id_1', extension: 'gif'},
            {id: 'file_id_2', extension: 'wma'},
            {id: 'file_id_3', extension: 'mp4'},
        ];
        const props = {...baseProps, fileInfos};
        const wrapper = shallow(<FilePreviewModal {...props}/>);

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
        const props = {...baseProps, fileInfos};
        const wrapper = shallow(<FilePreviewModal {...props}/>);

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
        const props = {...baseProps, fileInfos};
        const wrapper = shallow(<FilePreviewModal {...props}/>);

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
        const wrapper = shallow(<FilePreviewModal {...baseProps}/>);
        wrapper.setProps(nextProps);

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

    test('should match snapshot when plugin overrides the preview component', () => {
        const pluginFilePreviewComponents = [{
            id: generateId(),
            pluginId: 'file-preview',
            override: () => true,
            component: () => <div>{'Preview'}</div>,
        }];
        const props = {...baseProps, pluginFilePreviewComponents};
        const wrapper = shallow(<FilePreviewModal {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should fall back to default preview if plugin does not need to override preview component', () => {
        const pluginFilePreviewComponents = [{
            id: generateId(),
            pluginId: 'file-preview',
            override: () => false,
            component: () => <div>{'Preview'}</div>,
        }];
        const props = {...baseProps, pluginFilePreviewComponents};
        const wrapper = shallow(<FilePreviewModal {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });
});
