// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, ReactWrapper} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import GetPostLinkModal from 'components/get_post_link_modal/get_post_link_modal';
import GetLinkModal from 'components/get_link_modal';

describe('components/GetPostLinkModal', () => {
    const baseProps = {
        currentTeamUrl: 'http://localhost:8065/current-team',
        show: true,
        onHide: () => {},
    };

    test('should not render any model when no post\'s id is present', () => {
        const wrapper = shallow(<GetPostLinkModal {...baseProps}/>);
        expect(wrapper).toEqual({});
        expect(wrapper).toMatchSnapshot();
    });

    test('should not render any model when no post\'s id is invalid', () => {
        // if post id is undefined
        const props1 = {...baseProps, postId: undefined};
        const wrapper1 = shallow(<GetPostLinkModal {...props1}/>);
        expect(wrapper1).toEqual({});

        // if post id is empty
        const props2 = {...baseProps, postId: ''};
        const wrapper2 = shallow(<GetPostLinkModal {...props2}/>);
        expect(wrapper2).toEqual({});

        // if post id is number
        const props3 = {...baseProps, postId: 12345};
        const wrapper3 = shallow(<GetPostLinkModal {...props3}/>);
        expect(wrapper3).toEqual({});
    });

    test('should match snapshot with currentTeamUrl and post\'s id present', () => {
        const props = {...baseProps, show: false, postId: 'sample_post_id'};
        const wrapper = shallow(
            <GetPostLinkModal {...props}/>
        );

        expect(wrapper.find(GetLinkModal).prop('link')).toEqual(baseProps.currentTeamUrl + '/pl/sample_post_id');

        const helpText = 'The link below allows authorized users to see your post.';
        expect(wrapper.find(GetLinkModal).prop('helpText')).toEqual(helpText);
        expect(wrapper.find(GetLinkModal).prop('show')).toEqual(false);
        expect(wrapper.find(GetLinkModal).prop('title')).toEqual('Copy Permalink');

        expect(wrapper).toMatchSnapshot();
    });
});
