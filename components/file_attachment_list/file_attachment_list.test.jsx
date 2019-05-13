// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import FileAttachmentList from 'components/file_attachment_list/file_attachment_list.jsx';

describe('components/FileAttachmentList', () => {
    const post = {id: 'post_id', file_ids: ['file_id_1', 'file_id_2', 'file_id_3']};
    const fileInfos = [
        {id: 'file_id_3', name: 'image_3.png', extension: 'png', create_at: 3},
        {id: 'file_id_2', name: 'image_2.png', extension: 'png', create_at: 2},
        {id: 'file_id_1', name: 'image_1.png', extension: 'png', create_at: 1},
    ];
    const baseProps = {
        post,
        fileCount: 3,
        fileInfos,
        compactDisplay: false,
        isEmbedVisible: false,
        locale: 'en',
        actions: {getMissingFilesForPost: jest.fn()},
    };

    test('should match snapshot, multiple files ordered 1-2-3', () => {
        const wrapper = shallow(
            <FileAttachmentList {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, single image view', () => {
        const newPost = {...post, file_ids: ['file_id_1']};
        const wrapper = shallow(
            <FileAttachmentList
                {...baseProps}
                post={newPost}
                fileInfos={[{id: 'file_id_1', name: 'image_1.png', extension: 'png', create_at: 1}]}
                fileCount={1}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match state on handleImageClick', () => {
        const wrapper = shallow(
            <FileAttachmentList {...baseProps}/>
        );

        wrapper.setState({showPreviewModal: false, startImgIndex: 0});
        const newImageIndex = 1;
        wrapper.instance().handleImageClick(newImageIndex);

        expect(wrapper.state('showPreviewModal')).toEqual(true);
        expect(wrapper.state('startImgIndex')).toEqual(newImageIndex);
    });

    test('should match state on hidePreviewModal', () => {
        const wrapper = shallow(
            <FileAttachmentList {...baseProps}/>
        );

        wrapper.setState({showPreviewModal: true});
        wrapper.instance().hidePreviewModal();

        expect(wrapper.state('showPreviewModal')).toEqual(false);
    });
});
