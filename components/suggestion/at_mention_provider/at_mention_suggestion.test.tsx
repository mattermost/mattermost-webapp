// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import * as Utils from 'utils/utils.jsx';
import AtMentionSuggestion from 'components/suggestion/at_mention_provider/at_mention_suggestion.jsx';
import {mountWithIntl} from 'tests/helpers/intl-test-helper';

jest.mock('components/custom_status/custom_status_emoji', () => () => <div/>);
jest.spyOn(Utils, 'getFullName').mockReturnValue('a b');

describe('at mention suggestion', () => {
    const userid1 = {
        id: 'userid1',
        username: 'user',
        first_name: 'a',
        last_name: 'b',
        nickname: 'c',
        isCurrentUser: true,
    };

    const userid2 = {
        id: 'userid2',
        username: 'user2',
        first_name: 'a',
        last_name: 'b',
        nickname: 'c',
    };

    it('Should not display nick name of the signed in user', () => {
        const wrapper = mountWithIntl(
            <AtMentionSuggestion
                item={userid1}
                matchedPretext='@'
                term='@user'
            />,
        );

        expect(wrapper).toMatchSnapshot();

        expect(wrapper.find('.ml-2').text()).toEqual('a b');
        expect(wrapper.find('.ml-2').text()).not.toEqual('a b (c)');
    });

    it('Should display nick name of non signed in user', () => {
        const wrapper = mountWithIntl(
            <AtMentionSuggestion
                item={userid2}
                matchedPretext='@'
                term='@user'
            />,
        );

        expect(wrapper).toMatchSnapshot();

        expect(wrapper.find('.ml-2').text()).toEqual('a b (c)');
    });
});
