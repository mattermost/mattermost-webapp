// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {shallow} from 'enzyme';
import React from 'react';

import MarkdownImageExpand from './markdown_image_expand';

describe('components/MarkdownImageExpand', () => {
    it('should match snapshot for collapsed embeds', () => {
        const imageCollapseHandler = jest.fn();
        const wrapper = shallow(
            <MarkdownImageExpand
                alt={'Some alt text'}
                postId={'abc'}
                isEmbedVisible={false}
                actions={{toggleEmbedVisibility: imageCollapseHandler}}
            >{'An image to expand'}</MarkdownImageExpand>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot for expanded embeds', () => {
        const imageCollapseHandler = jest.fn();
        const wrapper = shallow(
            <MarkdownImageExpand
                alt={'Some alt text'}
                postId={'abc'}
                isEmbedVisible={true}
                actions={{toggleEmbedVisibility: imageCollapseHandler}}
            >{'An image to expand'}</MarkdownImageExpand>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should emit toggle action on collapse button click', () => {
        const imageCollapseHandler = jest.fn();
        const wrapper = shallow(
            <MarkdownImageExpand
                alt={'Some alt text'}
                postId={'abc'}
                isEmbedVisible={true}
                actions={{toggleEmbedVisibility: imageCollapseHandler}}
            >{'An image to expand'}</MarkdownImageExpand>,
        );

        wrapper.find('.markdown-image-expand__collapse-button').simulate('click');

        expect(imageCollapseHandler).toHaveBeenCalled();
    });

    it('should emit toggle action on expand button click', () => {
        const imageCollapseHandler = jest.fn();
        const wrapper = shallow(
            <MarkdownImageExpand
                alt={'Some alt text'}
                postId={'abc'}
                isEmbedVisible={false}
                actions={{toggleEmbedVisibility: imageCollapseHandler}}
            >{'An image to expand'}</MarkdownImageExpand>,
        );

        wrapper.find('.markdown-image-expand__expand-button').simulate('click');

        expect(imageCollapseHandler).toHaveBeenCalled();
    });
});
