// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {render} from '@testing-library/react';
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
    const baseProps = {
        suggestionProviders,
        searchTerms: '',
        keepFocused: false,
        setKeepFocused: jest.fn(),
        isFocused: false,
        isSideBarRight: false,
        isSearchingTerm: false,
        isFocus: false,
        searchType: '',
        clearSearchType: jest.fn(),
        children: null,
        updateHighlightedSearchHint: jest.fn(),
        handleChange: jest.fn(),
        handleSubmit: jest.fn(),
        handleEnterKey: jest.fn(),
        handleClear: jest.fn(),
        handleFocus: jest.fn(),
        handleBlur: jest.fn(),
    };

    it('should match snapshot without search', () => {
        const {container} = render(
            wrapIntl(<SearchBar {...baseProps}/>),
        );
        expect(container).toMatchSnapshot();
    });

    it('should match snapshot without search, without searchType', () => {
        const {container} = render(
            wrapIntl((
                <SearchBar {...baseProps}/>
            )),
        );
        expect(container).toMatchSnapshot();
    });

    it('should match snapshot without search, with searchType', () => {
        const {container} = render(
            wrapIntl((
                <SearchBar
                    {...baseProps}
                    searchType='files'
                />
            )),
        );
        expect(container).toMatchSnapshot();
    });

    it('should match snapshot with search, with searchType', () => {
        const {container} = render(
            wrapIntl((
                <SearchBar
                    {...baseProps}
                    searchTerms={'test'}
                    searchType='files'
                />
            )),
        );
        expect(container).toMatchSnapshot();
    });

    it('should match snapshot without search on focus', () => {
        const {container} = render(
            wrapIntl((
                <SearchBar
                    {...baseProps}
                    isFocused={true}
                />
            )),
        );
        expect(container).toMatchSnapshot();
    });

    it('should match snapshot with search', () => {
        const {container} = render(
            wrapIntl((
                <SearchBar
                    {...baseProps}
                    searchTerms={'test'}
                />
            )),
        );
        expect(container).toMatchSnapshot();
    });
});
