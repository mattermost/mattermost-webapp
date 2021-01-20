// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {shallow} from 'enzyme';
import React from 'react';

import MarkdownImageExpand from './markdown_image_expand';

describe('components/MarkdownImageExpand', () => {
    it('should match snapshot for collapseDisplay set to true', () => {
        const wrapper = shallow(
            <MarkdownImageExpand
                alt={'Some alt text'}
                collapseDisplay={true}
            >{'An image to expand'}</MarkdownImageExpand>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot for collapseDisplay set to false', () => {
        const wrapper = shallow(
            <MarkdownImageExpand
                alt={'Some alt text'}
                collapseDisplay={false}
            >{'An image to expand'}</MarkdownImageExpand>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot for image collapsed with collapse button', () => {
        const wrapper = shallow(
            <MarkdownImageExpand
                alt={'Some alt text'}
                collapseDisplay={false}
            >{'An image to expand'}</MarkdownImageExpand>,
        );

        wrapper.find('.markdown-image-expand__collapse-button').simulate('click');

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot for image expanded with expand button', () => {
        const wrapper = shallow(
            <MarkdownImageExpand
                alt={'Some alt text'}
                collapseDisplay={true}
            >{'An image to expand'}</MarkdownImageExpand>,
        );

        wrapper.find('.markdown-image-expand__expand-button').simulate('click');

        expect(wrapper).toMatchSnapshot();
    });
});
