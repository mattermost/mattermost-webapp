// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, mount, ReactWrapper} from 'enzyme';
import {IntlProvider, intlShape} from 'react-intl';

import GetPostLinkModal from 'components/get_post_link_modal/get_post_link_modal';
import GetLinkModal from 'components/get_link_modal';

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

        wrapper.setState({postId: 'post_id'});
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
        const intlProvider = new IntlProvider({locale: 'en', defaultLocale: 'en'}, {});
        const {intl} = intlProvider.getChildContext();
        const wrapper = mount(<GetPostLinkModal {...requiredProps}/>,
            {context: {intl}, childContextTypes: {intl: intlShape}}) as ReactWrapper<{}, {}, GetPostLinkModal>;

        const args = {post: {id: 'post_id', message: 'post message'}};

        wrapper.instance().handleToggle(true, args);
        expect(wrapper.state('show')).toEqual(true);
        expect(wrapper.state('postId')).toEqual(args.post.id);

        wrapper.instance().handleToggle(false, args);
        expect(wrapper.state('show')).toEqual(false);
        expect(wrapper.state('postId')).toEqual(args.post.id);
    });
});
