// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GetPostLinkModal from 'components/get_post_link_modal/get_post_link_modal.jsx';
import GetLinkModal from 'components/get_link_modal.jsx';

describe('components/GetPostLinkModal', () => {
    test('should match snapshot with currentTeamUrl passed in', () => {
        const wrapper = shallow(
            <GetPostLinkModal
                currentTeamUrl='http://current-team-url'
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call hide on GetLinkModal\'s onHide', () => {
        const wrapper = shallow(
            <GetPostLinkModal
                currentTeamUrl='http://current-team-url'
            />
        );

        wrapper.find(GetLinkModal).first().props().onHide();
        expect(wrapper.state('show')).toBe(false);
    })
});
