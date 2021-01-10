// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';

import SearchDateProvider from 'components/suggestion/search_date_provider';
import SearchChannelProvider from 'components/suggestion/search_channel_provider';
import SearchUserProvider from 'components/suggestion/search_user_provider';
import en from 'i18n/en.json';

import SearchBar from './search_bar.tsx';

const suggestionProviders = [
    new SearchDateProvider(),
    new SearchChannelProvider(jest.fn()),
    new SearchUserProvider(jest.fn()),
];

jest.mock('utils/utils', () => {
    const original = jest.requireActual('utils/utils');
    return {
        ...original,
        isMobile: jest.fn(() => false),
    };
});

const wrapIntl = (component) => (
    <IntlProvider
        locale={'en'}
        messages={en}
    >
        {component}
    </IntlProvider>
);

describe('components/search_bar/SearchBar', () => {
    const testChannel = {
        id: '123',
        team_name: 'team',
        create_at: 0,
        update_at: 0,
        delete_at: 0,
        team_id: 'id_123',
        type: 'O',
        display_name: 'name',
        name: 'DN',
        header: 'header',
        purpose: 'purpose',
        last_post_at: 0,
        total_msg_count: 0,
        extra_update_at: 0,
        creator_id: 'id',
        scheme_id: 'id',
        group_constrained: false,
    };
    const baseProps = {
        suggestionProviders,
        searchTerms: '',
        keepFocused: false,
        isFocused: false,
        isSideBarRight: false,
        isSearchingTerm: false,
        isFocus: false,
        children: null,
        currentChannel: testChannel,
        userName: 'user-1',
        updateHighlightedSearchHint: jest.fn(),
        updateSearchTerms: jest.fn(),
        handleChange: jest.fn(),
        handleSubmit: jest.fn(),
        handleEnterKey: jest.fn(),
        handleClear: jest.fn(),
        handleFocus: jest.fn(),
        handleBlur: jest.fn(),
    };

    it('should match snapshot without search', () => {
        const wrapper = shallow(
            wrapIntl(<SearchBar {...baseProps}/>),
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot without search on focus', () => {
        const wrapper = shallow(
            wrapIntl((
                <SearchBar
                    {...baseProps}
                    isFocussed={true}
                />
            )),
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot without search on focus in mobile', () => {
        const utils = require('utils/utils'); //eslint-disable-line global-require
        utils.isMobile.mockReturnValue(true);

        const wrapper = shallow(
            wrapIntl((
                <SearchBar
                    {...baseProps}
                    isFocussed={true}
                />
            )),
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with search', () => {
        const wrapper = shallow(
            wrapIntl((
                <SearchBar
                    {...baseProps}
                    searchTerms={'test'}
                />
            )),
        );
        expect(wrapper).toMatchSnapshot();
    });
});
