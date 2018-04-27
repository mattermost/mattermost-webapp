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
        message: 'wow gifvs!',
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
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<PostMp4 {...post}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
