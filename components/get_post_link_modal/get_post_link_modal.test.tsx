// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, ReactWrapper} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import GetPostLinkModal from 'components/get_post_link_modal/get_post_link_modal';
import GetLinkModal from 'components/get_link_modal';

describe('components/GetPostLinkModal', () => {
    const requiredProps = {
        currentTeamUrl: 'http://localhost:8065/current-team',
    };

    test('should not render any model when no post\'s id is present', () => {
        const wrapper = shallow(<GetPostLinkModal {...requiredProps}/>);
        expect(wrapper).toEqual({});
        expect(wrapper).toMatchSnapshot();
    });

    test('should not render any model when no post\'s id is invalid', () => {
        const wrapper = shallow(<GetPostLinkModal {...requiredProps}/>);

        // if post id is undefined
        wrapper.setState({postId: undefined});
        expect(wrapper).toEqual({});

        // if post id is empty
        wrapper.setState({postId: ''});
        expect(wrapper).toEqual({});

        // if post id is number
        wrapper.setState({postId: 12345});
        expect(wrapper).toEqual({});
    });

    test('should match snapshot with currentTeamUrl and post\'s id present', () => {
        const wrapper = shallow(
            <GetPostLinkModal {...requiredProps}/>
        );

        wrapper.setState({postId: 'sample_post_id'});
        expect(wrapper.find(GetLinkModal).prop('link')).toEqual(requiredProps.currentTeamUrl + '/pl/sample_post_id');

        const helpText = 'The link below allows authorized users to see your post.';
        expect(wrapper.find(GetLinkModal).prop('helpText')).toEqual(helpText);
        expect(wrapper.find(GetLinkModal).prop('show')).toEqual(false);
        expect(wrapper.find(GetLinkModal).prop('title')).toEqual('Copy Permalink');

        expect(wrapper).toMatchSnapshot();
    });

    test('should call hide on GetLinkModal\'s onHide', () => {
        const wrapper = shallow(
            <GetPostLinkModal {...requiredProps}/>
        );

        // Showing the modal initially to close it later onHide
        wrapper.setState({postId: 'sample_post_id', show: true});
        wrapper.find(GetLinkModal).first().props().onHide();

        expect(wrapper.state('show')).toBe(false);
    });

    test('should pass handleToggle', () => {
        const wrapper = mountWithIntl(<GetPostLinkModal {...requiredProps}/>) as unknown as ReactWrapper<{}, {}, GetPostLinkModal>;

        const args = {post: {id: 'sample_post_id', message: 'some post message'}};

        // Opening the model with handleToggle
        wrapper.instance().handleToggle(true, args);
        expect(wrapper.state('show')).toEqual(true);
        expect(wrapper.state('postId')).toEqual(args.post.id);

        // Closing the model with handleToggle
        wrapper.instance().handleToggle(false, args);
        expect(wrapper.state('show')).toEqual(false);
        expect(wrapper.state('postId')).toEqual(args.post.id);
    });
});
