// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SearchBar from './search_bar';

jest.mock('utils/utils', () => {
    const original = jest.requireActual('utils/utils');
    return {
        ...original,
        isMobile: jest.fn(() => false),
    };
});

describe('components/search_bar/SearchBar', () => {
    const baseProps = {
        isSearchingTerm: false,
        searchTerms: '',
        isMentionSearch: false,
        isFlaggedPosts: false,
        showMentionFlagBtns: false,
        isFocus: false,
        actions: {
            updateSearchTerms: jest.fn(),
            showSearchResults: jest.fn(),
            showMentions: jest.fn(),
            showFlaggedPosts: jest.fn(),
            closeRightHandSide: jest.fn(),
            autocompleteChannelsForSearch: jest.fn(),
            autocompleteUsersInTeam: jest.fn(),
        },
    };

    it('should match snapshot without search', () => {
        const wrapper = shallow(
            <SearchBar {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot without search on focus', () => {
        const wrapper = shallow(
            <SearchBar {...baseProps}/>,
        );
        wrapper.setState({focused: true});
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot without search on focus in mobile', () => {
        const utils = require('utils/utils'); //eslint-disable-line global-require
        utils.isMobile.mockReturnValue(true);

        const wrapper = shallow(
            <SearchBar {...baseProps}/>,
        );
        wrapper.setState({focused: true});
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with search', () => {
        const props = {
            ...baseProps,
            isSearchTerm: true,
            searchTerms: 'test',
        };

        const wrapper = shallow(
            <SearchBar {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
