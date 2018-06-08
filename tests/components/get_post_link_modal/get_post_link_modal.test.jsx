// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GetPostLinkModal from 'components/get_post_link_modal/get_post_link_modal.jsx';
import GetLinkModal from 'components/get_link_modal.jsx';

describe('components/GetPostLinkModal', () => {
    const requiredProps = {
        currentTeamUrl: 'http://localhost:8065/current-team',
    };

    test('should match snapshot with currentTeamUrl passed in', () => {
        const wrapper = shallow(
            <GetPostLinkModal {...requiredProps}/>
        );

        expect(wrapper).toMatchSnapshot();
        const helpText = 'The link below allows authorized users to see your post.';
        expect(wrapper.find(GetLinkModal).prop('helpText')).toEqual(helpText);
        expect(wrapper.find(GetLinkModal).prop('show')).toEqual(false);
        expect(wrapper.find(GetLinkModal).prop('title')).toEqual('Copy Permalink');
        expect(wrapper.find(GetLinkModal).prop('link')).toEqual(requiredProps.currentTeamUrl + '/pl/undefined');

        wrapper.setState({post: {id: 'post_id'}});
        expect(wrapper.find(GetLinkModal).prop('link')).toEqual(requiredProps.currentTeamUrl + '/pl/post_id');
    });

    test('should call hide on GetLinkModal\'s onHide', () => {
        const wrapper = shallow(
            <GetPostLinkModal {...requiredProps}/>
        );

        wrapper.find(GetLinkModal).first().props().onHide();
        expect(wrapper.state('show')).toBe(false);
    });

    test('should pass handleToggle', () => {
        const wrapper = shallow(
            <GetPostLinkModal {...requiredProps}/>
        );

        const args = {post: {id: 'post_id'}};
        wrapper.instance().handleToggle(true, args);
        expect(wrapper.state('show')).toEqual(true);
        expect(wrapper.state('post')).toEqual(args.post);

        args.post.message = 'post message';
        wrapper.instance().handleToggle(false, args);
        expect(wrapper.state('show')).toEqual(false);
        expect(wrapper.state('post')).toEqual(args.post);
    });
});
