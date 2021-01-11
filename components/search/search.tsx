// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, FormEvent, useEffect, useState, useRef} from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';

import {searchHintOptions, RHSStates} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import HeaderIconWrapper from 'components/channel_header/components/header_icon_wrapper';
import SearchHint from 'components/search_hint/search_hint';
import FlagIcon from 'components/widgets/icons/flag_icon';
import MentionsIcon from 'components/widgets/icons/mentions_icon';
import Popover from 'components/widgets/popover';
import UserGuideDropdown from 'components/channel_header/components/user_guide_dropdown';

import SearchBar from 'components/search_bar/search_bar';
import SearchResults from 'components/search_results';
import Provider from 'components/suggestion/provider';
import SearchDateProvider from 'components/suggestion/search_date_provider';
import SearchChannelProvider from 'components/suggestion/search_channel_provider';
import SearchUserProvider from 'components/suggestion/search_user_provider';

import type {Props} from './types';

interface SearchHintOption {
    searchTerm: string;
    message: {
        id: string;
        defaultMessage: string;
    };
}

const determineVisibleSearchHintOptions = (searchTerms: string): SearchHintOption[] => {
    let newVisibleSearchHintOptions: SearchHintOption[] = [];

    if (searchTerms.trim() === '') {
        return searchHintOptions;
    }

    const pretextArray = searchTerms.split(/\s+/g);
    const pretext = pretextArray[pretextArray.length - 1];
    const penultimatePretext = pretextArray[pretextArray.length - 2];

    const shouldShowHintOptions = penultimatePretext ? !searchHintOptions.some(({searchTerm}) => penultimatePretext.toLowerCase().endsWith(searchTerm.toLowerCase())) : !searchHintOptions.some(({searchTerm}) => searchTerms.toLowerCase().endsWith(searchTerm.toLowerCase()));

    if (shouldShowHintOptions) {
        try {
            newVisibleSearchHintOptions = searchHintOptions.filter((option) => {
                return new RegExp(pretext, 'ig').
                    test(option.searchTerm) && option.searchTerm.toLowerCase() !== pretext.toLowerCase();
            });
        } catch {
            newVisibleSearchHintOptions = [];
        }
    }

    return newVisibleSearchHintOptions;
};

const Search: React.FC<Props> = (props: Props): JSX.Element => {
    const {actions, searchTerms} = props;

    const intl = useIntl();

    // generate intial component state and setters
    const [focused, setFocused] = useState<boolean>(false);
    const [keepInputFocused, setKeepInputFocused] = useState<boolean>(false);
    const [indexChangedViaKeyPress, setIndexChangedViaKeyPress] = useState<boolean>(false);
    const [highlightedSearchHintIndex, setHighlightedSearchHintIndex] = useState<number>(-1);
    const [visibleSearchHintOptions, setVisibleSearchHintOptions] = useState<SearchHintOption[]>(
        determineVisibleSearchHintOptions(searchTerms),
    );

    const suggestionProviders = useRef<Provider[]>([
        new SearchDateProvider(),
        new SearchChannelProvider(actions.autocompleteChannelsForSearch),
        new SearchUserProvider(actions.autocompleteUsersInTeam),
    ]);

    useEffect((): void => {
        if (!Utils.isMobile()) {
            setVisibleSearchHintOptions(determineVisibleSearchHintOptions(searchTerms));
        }
    }, [searchTerms]);

    useEffect((): void => {
        if (!Utils.isMobile() && focused && keepInputFocused) {
            handleBlur();
        }
    }, [searchTerms]);

    useEffect((): void => {
        if (props.isFocus && !props.isRhsOpen) {
            handleFocus();
        } else {
            handleBlur();
        }
    }, [props.isRhsOpen]);

    // handle cloding of rhs-flyout
    const handleClose = (): void => actions.closeRightHandSide();

    // focus the search input
    const handleFocus = (): void => setFocused(true);

    // release focus from the search input or unset `keepInputFocused` value
    // `keepInputFocused` is used to keep the search input focused when a
    // user selects a suggestion from `SearchHint` with a click
    const handleBlur = (): void => {
        // add time out so that the pinned and member buttons are clickable
        // when focus is released from the search box.
        setTimeout((): void => {
            if (keepInputFocused) {
                setKeepInputFocused(false);
            } else {
                setFocused(false);
            }
        }, 0);

        updateHighlightedSearchHint();
    };

    const handleSearchHintSelection = (): void => {
        if (focused) {
            setKeepInputFocused(true);
        } else {
            setFocused(true);
        }
    };

    const handleAddSearchTerm = (term: string): void => {
        const pretextArray = searchTerms?.split(' ') || [];
        pretextArray.pop();
        pretextArray.push(term.toLowerCase());
        actions.updateSearchTerms(pretextArray.join(' '));
        updateHighlightedSearchHint();
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const term = e.target.value;
        actions.updateSearchTerms(term);
    };

    // call this function without parameters to reset `SearchHint`
    const updateHighlightedSearchHint = (indexDelta = 0, changedViaKeyPress = false): void => {
        if (Math.abs(indexDelta) > 1) {
            return;
        }

        let newIndex = highlightedSearchHintIndex + indexDelta;

        switch (indexDelta) {
        case 1:
            // KEY.DOWN
            // is it at the end of the list?
            newIndex = newIndex === visibleSearchHintOptions.length ? 0 : newIndex;
            break;
        case -1:
            // KEY.UP
            // is it at the start of the list (or initial value)?
            newIndex = newIndex < 0 ? visibleSearchHintOptions.length - 1 : newIndex;
            break;
        case 0:
        default:
            // reset the index (e.g. on blur)
            newIndex = -1;
        }

        setHighlightedSearchHintIndex(newIndex);
        setIndexChangedViaKeyPress(changedViaKeyPress);
    };

    const handleEnterKey = (e: ChangeEvent<HTMLInputElement>): void => {
        // only prevent default-behaviour, when one of the conditions is true
        // when both are false just submit the form (default behaviour) with
        // `handleSubmit` function called from the `form`
        if (indexChangedViaKeyPress) {
            e.preventDefault();
            setKeepInputFocused(true);
            handleAddSearchTerm(visibleSearchHintOptions[highlightedSearchHintIndex].searchTerm);
        }

        if (props.isMentionSearch) {
            e.preventDefault();
            actions.updateRhsState(RHSStates.SEARCH);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        handleSearch().then(() => {
            setKeepInputFocused(false);
            setFocused(false);
        });
    };

    const handleSearch = async (): Promise<void> => {
        const terms = searchTerms.trim();

        if (terms.length === 0) {
            return;
        }

        const {error} = await actions.showSearchResults(Boolean(props.isMentionSearch));

        if (!error) {
            handleSearchOnSuccess();
        }
    };

    const handleSearchOnSuccess = (): void => {
        if (Utils.isMobile()) {
            handleClear();
        }
    };

    const handleClear = (): void => {
        if (props.isMentionSearch) {
            setFocused(false);
            actions.updateRhsState(RHSStates.SEARCH);
        }
        actions.updateSearchTerms('');
    };

    const handleShrink = (): void => {
        props.actions.setRhsExpanded(false);
    };

    const setHoverHintIndex = (_highlightedSearchHintIndex: number): void => {
        setHighlightedSearchHintIndex(_highlightedSearchHintIndex);
        setIndexChangedViaKeyPress(false);
    };

    const searchMentions = (e: ChangeEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        if (props.isMentionSearch) {
            actions.closeRightHandSide();
            return;
        }
        actions.showMentions();
    };

    const getFlagged = (e: ChangeEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        if (props.isFlaggedPosts) {
            actions.closeRightHandSide();
            return;
        }
        actions.showFlaggedPosts();
    };

    const renderMentionButton = (): JSX.Element => (
        <HeaderIconWrapper
            iconComponent={
                <MentionsIcon
                    className='icon icon--standard'
                    aria-hidden='true'
                />
            }
            ariaLabel={true}
            buttonClass={classNames(
                'channel-header__icon',
                {'channel-header__icon--active': props.isMentionSearch},
            )}
            buttonId={props.isSideBarRight ? 'sbrChannelHeaderMentionButton' : 'channelHeaderMentionButton'}
            onClick={searchMentions}
            tooltipKey={'recentMentions'}
            isRhsOpen={props.isRhsOpen}
        />
    );

    const renderFlagBtn = (): JSX.Element => (
        <HeaderIconWrapper
            iconComponent={
                <FlagIcon className='icon icon--standard'/>
            }
            ariaLabel={true}
            buttonClass={classNames(
                'channel-header__icon ',
                {'channel-header__icon--active': props.isFlaggedPosts},
            )}
            buttonId={props.isSideBarRight ? 'sbrChannelHeaderFlagButton' : 'channelHeaderFlagButton'}
            onClick={getFlagged}
            tooltipKey={'flaggedPosts'}
            isRhsOpen={props.isRhsOpen}
        />
    );

    const renderHintPopover = (): JSX.Element => {
        let termsUsed = 0;

        searchTerms?.split(/[: ]/g).forEach((word: string): void => {
            if (searchHintOptions.some(({searchTerm}) => searchTerm.toLowerCase() === word.toLowerCase())) {
                termsUsed++;
            }
        });

        if (visibleSearchHintOptions.length === 0 || props.isMentionSearch) {
            return <></>;
        }

        const helpClass = `search-help-popover${(focused && termsUsed <= 2) ? ' visible' : ''}`;

        return (
            <Popover
                id={`${props.isSideBarRight ? 'sbr-' : ''}searchbar-help-popup`}
                placement='bottom'
                className={helpClass}
            >
                <SearchHint
                    options={visibleSearchHintOptions}
                    withTitle={true}
                    onOptionSelected={handleAddSearchTerm}
                    onMouseDown={handleSearchHintSelection}
                    highlightedIndex={highlightedSearchHintIndex}
                    onOptionHover={setHoverHintIndex}
                />
            </Popover>
        );
    };

    const renderSearchBar = (): JSX.Element => (
        <>
            <div className='sidebar-collapse__container'>
                <div
                    id={props.isSideBarRight ? 'sbrSidebarCollapse' : 'sidebarCollapse'}
                    className='sidebar-collapse'
                    onClick={handleClose}
                >
                    <span
                        className='fa fa-2x fa-angle-left'
                        title={intl.formatMessage({id: 'generic_icons.back', defaultMessage: 'Back Icon'})}
                    />
                </div>
            </div>
            <SearchBar
                updateHighlightedSearchHint={updateHighlightedSearchHint}
                handleEnterKey={handleEnterKey}
                handleClear={handleClear}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                handleFocus={handleFocus}
                handleBlur={handleBlur}
                keepFocused={keepInputFocused}
                isFocused={focused}
                suggestionProviders={suggestionProviders.current}
                isSideBarRight={props.isSideBarRight}
                isSearchingTerm={props.isSearchingTerm}
                isFocus={props.isFocus}
                getFocus={props.getFocus}
                searchTerms={searchTerms}
            >
                {!Utils.isMobile() && renderHintPopover()}
            </SearchBar>
        </>
    );

    // when inserted in the `ChannelHeader` component just return the for with `SearchBar`
    if (!props.isSideBarRight) {
        return (
            <div className='sidebar-right__table'>
                {renderSearchBar()}
            </div>
        );
    }

    return (
        <div className='sidebar--right__content'>
            <div className='search-bar__container channel-header alt'>
                <div className='sidebar-right__table'>
                    {renderSearchBar()}
                    {renderMentionButton()}
                    {renderFlagBtn()}
                    <UserGuideDropdown/>
                </div>
            </div>
            {props.searchVisible ? (
                <SearchResults
                    isMentionSearch={props.isMentionSearch}
                    isFlaggedPosts={props.isFlaggedPosts}
                    isPinnedPosts={props.isPinnedPosts}
                    shrink={handleShrink}
                    channelDisplayName={props.channelDisplayName}
                    isOpened={props.isSideBarRightOpen}
                    updateSearchTerms={handleAddSearchTerm}
                    handleSearchHintSelection={handleSearchHintSelection}
                    isSideBarExpanded={props.isRhsExpanded}
                    getMorePostsForSearch={props.actions.getMorePostsForSearch}
                />
            ) : props.children}
        </div>
    );
};

const defaultProps: Partial<Props> = {
    searchTerms: '',
    channelDisplayName: '',
    isFocus: false,
    isSideBarRight: false,
    getFocus: () => {},
};

Search.defaultProps = defaultProps;

export default React.memo(Search);
