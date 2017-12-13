// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {Provider} from 'react-redux';

import store from 'stores/redux_store.jsx';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import PostMessageView from 'components/post_view/post_message_view/post_message_view.jsx';

class PostTypePlugin extends React.PureComponent {
    render() {
        return <span id='pluginId'>{'PostTypePlugin'}</span>;
    }
}

describe('plugins/PostMessageView', () => {
    const post = {type: 'testtype', message: 'this is some text'};
    const pluginPostTypes = {
        testtype: {component: PostTypePlugin}
    };

    const requiredProps = {
        post,
        pluginPostTypes,
        currentUser: {username: 'username'},
        team: {name: 'team_name'},
        emojis: {name: 'smile'},
        theme: {id: 'theme_id'},
        enableFormatting: true
    };

    test('should match snapshot with extended post type', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <PostMessageView {...requiredProps}/>
            </Provider>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#pluginId').text()).toBe('PostTypePlugin');
    });

    test('should match snapshot with no extended post type', () => {
        const props = {...requiredProps, pluginPostTypes: {}};
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <PostMessageView {...props}/>
            </Provider>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
