// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {mount} from 'enzyme';

import PostMessageView from 'components/post_view/post_message_view/post_message_view.jsx';

class PostTypePlugin extends React.PureComponent {
    render() {
        return <span>{'PostTypePlugin'}</span>;
    }
}

describe('plugins/PostMessageView', () => {
    test('should match snapshot with extended post type', () => {
        const wrapper = mount(
            <PostMessageView
                post={{type: 'testtype'}}
                emojis={{}}
                team={{}}
                enableFormatting={true}
                theme={{}}
                pluginPostTypes={{testtype: {component: PostTypePlugin}}}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with no extended post type', () => {
        const wrapper = mount(
            <PostMessageView
                post={{type: 'testtype'}}
                emojis={{}}
                team={{}}
                enableFormatting={true}
                theme={{}}
                pluginPostTypes={{}}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
