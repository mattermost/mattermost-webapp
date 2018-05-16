// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import PostMp4 from 'components/post_view/post_mp4/post_mp4.jsx';

describe('components/post_view/PostMp4', () => {
    const post = {
        channel_id: 'g6139tbospd18cmxroesdk3kkc',
        create_at: 1502715365009,
        delete_at: 0,
        edit_at: 1502715372443,
        hashtags: '',
        id: 'e584uzbwwpny9kengqayx5ayzw',
        is_pinned: false,
        message: 'https://i.imgur.com/FY1AbSo.gifv',
        link: 'https://i.imgur.com/FY1AbSo.gifv',
        hasImageProxy: false,
        original_id: '',
        parent_id: '',
        pending_post_id: '',
        props: {},
        root_id: '',
        type: '',
        update_at: 1502715372443,
        user_id: 'b4pfxi8sn78y8yq7phzxxfor7h',
        has_preview_image: true,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<PostMp4 {...post}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state loaded and erroed', () => {
        const wrapper = shallow(<PostMp4 {...post}/>);

        expect(wrapper.state('loaded')).toBe(true);
        expect(wrapper.state('errored')).toBe(false);
    });
    test('should cause handleImageLink to be executed', () => {
        //have to reproduce local react functions and test if called
        const handleImageClick = jest.fn();
        const onLinkLoaded = jest.fn();
        const props = {...post, handleImageClick, onLinkLoaded};
        const e = {preventDefault: () => {
            return false;
        }};
        const wrapper = shallow(<PostMp4 {...props}/>);
        wrapper.instance().onImageClick(e);
        expect(handleImageClick).toHaveBeenCalledTimes(1);
        expect(onLinkLoaded).toHaveBeenCalledTimes(1);
    });
    test('should cause onLinkLoadError to be executed', () => {
        //have to reproduce local react functions and test if called
        const onLinkLoadError = jest.fn();
        const props = {...post, onLinkLoadError};

        const wrapper = shallow(<PostMp4 {...props}/>);
        wrapper.instance().handleLoadError();
        expect(onLinkLoadError).toHaveBeenCalledTimes(1);
        expect(wrapper.state('loaded')).toBe(false);
        expect(wrapper.state('errored')).toBe(true);
    });
    test('should cause onLinkLoaded to be executed', () => {
        //have to reproduce local react functions and test if called
        const onLinkLoaded = jest.fn();
        const props = {...post, onLinkLoaded};

        const wrapper = shallow(<PostMp4 {...props}/>);
        wrapper.instance().handleLoadComplete();
        expect(onLinkLoaded).toHaveBeenCalledTimes(2);
        expect(wrapper.state('loaded')).toBe(true);
        expect(wrapper.state('errored')).toBe(false);
    });
});

describe('components/post_view/PostMp4 with proxy', () => {
    const post = {
        channel_id: 'g6139tbospd18cmxroesdk3kkc',
        create_at: 1502715365009,
        delete_at: 0,
        edit_at: 1502715372443,
        hashtags: '',
        id: 'e584uzbwwpny9kengqayx5ayzw',
        is_pinned: false,
        message: 'https://i.imgur.com/FY1AbSo.gifv',
        link: 'https://i.imgur.com/FY1AbSo.gifv',
        hasImageProxy: true,
        original_id: '',
        parent_id: '',
        pending_post_id: '',
        props: {},
        root_id: '',
        type: '',
        update_at: 1502715372443,
        user_id: 'b4pfxi8sn78y8yq7phzxxfor7h',
        has_preview_image: true,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<PostMp4 {...post}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state loaded and erroed', () => {
        const wrapper = shallow(<PostMp4 {...post}/>);

        expect(wrapper.state('loaded')).toBe(true);
        expect(wrapper.state('errored')).toBe(false);
    });
    test('should cause handleImageLink to be executed', () => {
        //have to reproduce local react functions and test if called
        const handleImageClick = jest.fn();
        const onLinkLoaded = jest.fn();
        const props = {...post, handleImageClick, onLinkLoaded};
        const e = {preventDefault: () => {
            return false;
        }};
        const wrapper = shallow(<PostMp4 {...props}/>);
        wrapper.instance().onImageClick(e);
        expect(handleImageClick).toHaveBeenCalledTimes(1);
        expect(onLinkLoaded).toHaveBeenCalledTimes(1);
    });
    test('should cause onLinkLoadError to be executed', () => {
        //have to reproduce local react functions and test if called
        const onLinkLoadError = jest.fn();
        const props = {...post, onLinkLoadError};

        const wrapper = shallow(<PostMp4 {...props}/>);
        wrapper.instance().handleLoadError();
        expect(onLinkLoadError).toHaveBeenCalledTimes(1);
        expect(wrapper.state('loaded')).toBe(false);
        expect(wrapper.state('errored')).toBe(true);
    });
    test('should cause onLinkLoaded to be executed', () => {
        //have to reproduce local react functions and test if called
        const onLinkLoaded = jest.fn();
        const props = {...post, onLinkLoaded};

        const wrapper = shallow(<PostMp4 {...props}/>);
        wrapper.instance().handleLoadComplete();
        expect(onLinkLoaded).toHaveBeenCalledTimes(2);
        expect(wrapper.state('loaded')).toBe(true);
        expect(wrapper.state('errored')).toBe(false);
    });
});