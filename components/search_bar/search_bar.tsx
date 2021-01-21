// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, CSSProperties, FormEvent, useEffect, useRef} from 'react';
import classNames from 'classnames';
import {useIntl} from 'react-intl';
import {Action} from 'redux';

import {Channel} from 'mattermost-redux/src/types/channels';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import SearchSuggestionList from 'components/suggestion/search_suggestion_list.jsx';
import SuggestionDate from 'components/suggestion/suggestion_date.jsx';
import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import Provider from 'components/suggestion/provider';

const {KeyCodes} = Constants;

const style: Record<string, CSSProperties> = {
    searchForm: {overflow: 'visible'},
};

type Props = {
    searchTerms: string;
    updateHighlightedSearchHint: (indexDelta: number, changedViaKeyPress?: boolean) => void;
    updateSearchTerms: (term: string) => Action;
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
    handleEnterKey: (e: ChangeEvent<HTMLInputElement>) => void;
    handleClear: () => void;
    handleFocus: () => void;
    handleBlur: () => void;
    keepFocussed: boolean;
    isFocussed: boolean;
    suggestionProviders: Provider[];
    isSearchingTerm: boolean;
    isFocus: boolean;
    isSideBarRight?: boolean;
    getFocus?: (searchBarFocus: () => void) => void;
    children?: React.ReactNode;
    currentChannel: Channel;
    userName: string;
}

const defaultProps: Partial<Props> = {
    isSideBarRight: false,
    getFocus: (): void => {},
    children: null,
};

const SearchBar: React.FunctionComponent<Props> = (props: Props): JSX.Element => {
    const {isFocussed, keepFocussed, searchTerms, suggestionProviders, currentChannel, userName} = props;

    const searchRef = useRef<SuggestionBox>();
    const intl = useIntl();

    useEffect(() => {
        if (!Utils.isMobile() && currentChannel?.display_name) {
            document.addEventListener('keydown', searchCurrentChannel);
        }
        return () => {
            document.removeEventListener('keydown', searchCurrentChannel);
        };
    }, [currentChannel?.display_name]);

    /**
      * On HotKey CMD/Ctrl + Shift + F prefill the search box with "in: {current channel}" or "in: @username"
      * @param {KeyboardEvent} e Event
      */
    const searchCurrentChannel = (e: KeyboardEvent) => {
        if (
            !e.altKey &&
            (e.ctrlKey || e.metaKey) &&
            e.shiftKey &&
            Utils.isKeyPressed(e, Constants.KeyCodes.F)
        ) {
            e.preventDefault();
            searchRef.current?.focus();

            // To prevent event from executing on holding down.
            // https://stackoverflow.com/a/38241109
            if (e.repeat) {
                return;
            }

            let searchKey = '';

            // Space added at end to make sure channel/user related hint is not shown.
            if (['O', 'P'].includes(currentChannel.type)) {
                searchKey = `in: ${currentChannel.display_name} `;
            } else if (currentChannel.type === 'G') {
                // For group we need to remove the whitespaces in displayname and append the currentUsername
                searchKey = `in: @${currentChannel.display_name.replace(/\s/g, '')},${userName} `;
            } else {
                searchKey = `in: @${currentChannel.display_name} `;
            }
            props.updateSearchTerms(searchKey);
        }
    };
    useEffect((): void => {
        const shouldFocus = isFocussed || keepFocussed;
        if (shouldFocus) {
            // let redux handle changes before focussing the input
            setTimeout(() => searchRef.current?.focus(), 0);
        } else {
            setTimeout(() => searchRef.current?.blur(), 0);
        }
    }, [isFocussed, keepFocussed]);

    useEffect((): void => {
        if (isFocussed && !keepFocussed && searchTerms.endsWith('""')) {
            setTimeout(() => searchRef.current?.focus(), 0);
        }
    }, [searchTerms]);

    const handleKeyDown = (e: ChangeEvent<HTMLInputElement>): void => {
        if (Utils.isKeyPressed(e, KeyCodes.ESCAPE)) {
            searchRef.current?.blur();
            e.stopPropagation();
            e.preventDefault();
        }

        if (Utils.isKeyPressed(e, KeyCodes.DOWN)) {
            e.preventDefault();
            props.updateHighlightedSearchHint(1, true);
        }

        if (Utils.isKeyPressed(e, KeyCodes.UP)) {
            e.preventDefault();
            props.updateHighlightedSearchHint(-1, true);
        }

        if (Utils.isKeyPressed(e, KeyCodes.ENTER)) {
            props.handleEnterKey(e);
        }
    };

    const getSearch = (node: SuggestionBox): void => {
        searchRef.current = node;
        if (props.getFocus) {
            props.getFocus(props.handleFocus);
        }
    };

    return (
        <div
            id={props.isSideBarRight ? 'sbrSearchFormContainer' : 'searchFormContainer'}
            className='search-form__container'
        >
            <form
                role='application'
                className={classNames(['search__form', {'search__form--focused': isFocussed}])}
                onSubmit={props.handleSubmit}
                style={style.searchForm}
                autoComplete='off'
                aria-labelledby='searchBox'
            >
                <div className='search__font-icon'>
                    <i className='icon icon-magnify icon-16'/>
                </div>
                <SuggestionBox
                    ref={getSearch}
                    id={props.isSideBarRight ? 'sbrSearchBox' : 'searchBox'}
                    tabIndex='0'
                    className='search-bar a11y__region'
                    containerClass='w-full'
                    data-a11y-sort-order='9'
                    aria-describedby={props.isSideBarRight ? 'sbr-searchbar-help-popup' : 'searchbar-help-popup'}
                    aria-label={intl.formatMessage({id: 'search_bar.search', defaultMessage: 'Search'})}
                    placeholder={intl.formatMessage({id: 'search_bar.search', defaultMessage: 'Search'})}
                    value={props.searchTerms}
                    onFocus={props.handleFocus}
                    onBlur={props.handleBlur}
                    onChange={props.handleChange}
                    onKeyDown={handleKeyDown}
                    listComponent={SearchSuggestionList}
                    dateComponent={SuggestionDate}
                    providers={suggestionProviders}
                    type='search'
                    autoFocus={props.isFocus && searchTerms === ''}
                    delayInputUpdate={true}
                    renderDividers={true}
                    clearable={true}
                    onClear={props.handleClear}
                />
                {props.isSearchingTerm && <LoadingSpinner/>}
                {props.children}
            </form>
        </div>
    );
};

SearchBar.defaultProps = defaultProps;

export default SearchBar;
