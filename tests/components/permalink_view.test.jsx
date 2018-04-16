// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {emitPostFocusEvent} from 'actions/global_actions.jsx';

import PermalinkView from 'components/permalink_view/permalink_view.jsx';

jest.mock('actions/global_actions.jsx', () => ({
    emitPostFocusEvent: jest.fn(),
}));

describe('components/PermalinkView', () => {
    const baseProps = {
        channelId: 'channel_id',
        channelName: 'channel_name',
        match: {params: {postid: 'post_id'}},
        returnTo: 'return_to',
        teamName: 'team_name',
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <PermalinkView {...baseProps}/>
        );

        wrapper.setState({valid: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should call emitPostFocusEvent on doPermalinkEvent', () => {
        const wrapper = shallow(
            <PermalinkView {...baseProps}/>
        );

        wrapper.setState({valid: false});
        wrapper.instance().doPermalinkEvent();
        expect(emitPostFocusEvent).toHaveBeenCalledTimes(1);
        expect(emitPostFocusEvent).toBeCalledWith(baseProps.match.params.postid, baseProps.returnTo);
    });
});