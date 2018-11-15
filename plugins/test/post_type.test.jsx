// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, mount} from 'enzyme';

import PostMessageView from 'components/post_view/post_message_view/post_message_view.jsx';

class PostTypePlugin extends React.PureComponent {
    render() {
        return <span id='pluginId'>{'PostTypePlugin'}</span>;
    }
}

describe('plugins/PostMessageView', () => {
    const post = {type: 'testtype', message: 'this is some text'};
    const pluginPostTypes = {
        testtype: {component: PostTypePlugin},
    };

    const requiredProps = {
        post,
        pluginPostTypes,
        currentUser: {username: 'username'},
        team: {name: 'team_name'},
        emojis: {name: 'smile'},
        theme: {id: 'theme_id'},
        enableFormatting: true,
    };

    test('should match snapshot with extended post type', () => {
        const wrapper = mount(
            <PostMessageView {...requiredProps}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#pluginId').text()).toBe('PostTypePlugin');
    });

    test('should match snapshot with no extended post type', () => {
        const props = {...requiredProps, pluginPostTypes: {}};
        const wrapper = shallow(
            <PostMessageView {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
