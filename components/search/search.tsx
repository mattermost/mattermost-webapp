// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {searchHintOptions, RHSStates} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import HeaderIconWrapper from 'components/channel_header/components/header_icon_wrapper';
import SearchHint from 'components/search_hint/search_hint';
import FlagIcon from 'components/widgets/icons/flag_icon';
import MentionsIcon from 'components/widgets/icons/mentions_icon';
import Popover from 'components/widgets/popover';
import UserGuideDropdown from 'components/channel_header/components/user_guide_dropdown';

import SearchBar from 'components/search_bar';
import SearchResults from 'components/search_results';
import SearchDateProvider from 'components/suggestion/search_date_provider';
import SearchChannelProvider from 'components/suggestion/search_channel_provider';
import SearchUserProvider from 'components/suggestion/search_user_provider';

interface SearchHintOption {
    searchTerm: string,
    message: {
        id: string,
        defaultMessage: string,
    },
}

type Props = {
    isSideBarRight?: boolean,
    isSideBarRightOpen?: boolean,
    isFocus: boolean,
    channelDisplayName?: string,
    getFocus?: (searchBarFocus: () => void) => void,
    children?: React.ReactNode,

    // props from redux connect
    searchTerms: string,
    searchVisible: boolean,
    isSearchingTerm: boolean,
    isMentionSearch: boolean,
    isFlaggedPosts: boolean,
    isPinnedPosts: boolean,
    isRhsOpen: boolean,
    isRhsExpanded: boolean,
    actions: {
        updateSearchTerms: (term: string) => void,
        showSearchResults: (isMentionSearch: boolean) => Record<string, unknown>,
        showMentions: () => void,
        showFlaggedPosts: () => void,
        setRhsExpanded: (expanded: boolean) => void,
        closeRightHandSide: () => void,
        autocompleteChannelsForSearch: (channelPrefix: string, callback: () => void) => void,
        autocompleteUsersInTeam: (usernamePrefix: string) => void,
        updateRhsState: (rhsState: string) => void,
    }
}

const Search: React.FC<Props> = (props: Props): JSX.Element => {
    const {actions, searchTerms} = props;

    // generate intial component state and setters
    const [focussed, setFocussed] = useState<boolean>(false);
    const [keepInputFocussed, setKeepInputFocussed] = useState<boolean>(false);
    const [indexChangedViaKeyPress, setIndexChangedViaKeyPress] = useState<boolean>(false);
    const [highlightedSearchHintIndex, setHighlightedSearchHintIndex] = useState<number>(-1);
    const [visibleSearchHintOptions, setVisibleSearchHintOptions] = useState<SearchHintOption[]>(determineVisibleSearchHintOptions(searchTerms));

    const suggestionProviders = [
        new SearchDateProvider(),
        new SearchChannelProvider(actions.autocompleteChannelsForSearch),
        new SearchUserProvider(actions.autocompleteUsersInTeam),
    ];

    useEffect((): void => {
        setVisibleSearchHintOptions(determineVisibleSearchHintOptions(searchTerms));
    }, [searchTerms]);

    // this specific function needs to be a function expression
    // because it is called while components initial state is generated
    function determineVisibleSearchHintOptions(_searchTerms: string): SearchHintOption[] {
        let newVisibleSearchHintOptions: SearchHintOption[] = [];

        if (_searchTerms.trim() === '') {
            return searchHintOptions;
        }

        const pretextArray = _searchTerms.split(/\s+/g);
        const pretext = pretextArray[pretextArray.length - 1];
        const penultimatePretext = pretextArray[pretextArray.length - 2];

        const shouldShowHintOptions = penultimatePretext ? !searchHintOptions.some(({searchTerm}) => penultimatePretext.toLowerCase().endsWith(searchTerm.toLowerCase())) : !searchHintOptions.some(({searchTerm}) => _searchTerms.toLowerCase().endsWith(searchTerm.toLowerCase()));

        if (shouldShowHintOptions) {
            try {
                newVisibleSearchHintOptions = searchHintOptions.filter((option) => {
                    return new RegExp(pretext, 'ig').test(option.searchTerm) && option.searchTerm.toLowerCase() !== pretext.toLowerCase();
                });
            } catch {
                newVisibleSearchHintOptions = [];
            }
        }

        return newVisibleSearchHintOptions;
    }

    // handle cloding of rhs-flyout
    const handleClose = (): void => actions.closeRightHandSide();

    // focus the search input
    const handleFocus = (): void => setFocussed(true);

    // release focus from the search input or unset `keepInputFocussed` value
    // `keepInputFocussed` is used to keep the search input focussed when a
    // user selects a suggestion from `SearchHint` with a click
    const handleBlur = (): void => {
        // add time out so that the pinned and member buttons are clickable
        // when focus is released from the search box.
        setTimeout((): void => {
            if (keepInputFocussed) {
                setKeepInputFocussed(false);
            } else {
                setFocussed(false);
            }
        }, 0);

        updateHighlightedSearchHint(0);
    };

    const handleSearchHintSelection = (): void => {
        setKeepInputFocussed(true);
    };

    const handleAddSearchTerm = (term: string): void => {
        const pretextArray = searchTerms?.split(' ') || [];
        pretextArray.pop();
        pretextArray.push(term.toLowerCase());
        actions.updateSearchTerms(pretextArray.join(' '));
        updateHighlightedSearchHint(0);
    };

    const handleUpdateSearchTerms = (term: string): void => {
        actions.updateSearchTerms(term);
        setFocussed(true);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const term = e.target.value;
        actions.updateSearchTerms(term);
    };

    const updateHighlightedSearchHint = (indexDelta: number, changedViaKeyPress = false): void => {
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
            handleAddSearchTerm(visibleSearchHintOptions[highlightedSearchHintIndex].searchTerm);
            setKeepInputFocussed(true);
        }

        if (props.isMentionSearch) {
            e.preventDefault();
            actions.updateRhsState(RHSStates.SEARCH);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        handleSearch().then(() => {
            setKeepInputFocussed(false);
            setFocussed(false);
        });
    };

    const handleSearch = async (): Promise<void> => {
        const terms = searchTerms.trim();

        if (terms.length === 0) {
            return;
        }

        if (terms.length) {
            const {error} = await actions.showSearchResults?.(Boolean(props.isMentionSearch));

            if (!error) {
                handleSearchOnSuccess();
            }
        }
    };

    const handleSearchOnSuccess = (): void => {
        if (Utils.isMobile()) {
            handleClear();
        }
    };

    const handleClear = (): void => {
        if (props.isMentionSearch) {
            setFocussed(false);
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
            actions.closeRightHandSide?.();
            return;
        }
        actions.showMentions();
    };

    const getFlagged = (e: ChangeEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        if (props.isFlaggedPosts) {
            actions.closeRightHandSide?.();
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

        if (visibleSearchHintOptions.length > 0 && !props.isMentionSearch) {
            const helpClass = `search-help-popover${(focussed && termsUsed <= 2) ? ' visible' : ''}`;

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
        }

        return <></>;
    };

    const renderSearchBar = ():JSX.Element => (
        <>
            <div className='sidebar-collapse__container'>
                <div
                    id={props.isSideBarRight ? 'sbrSidebarCollapse' : 'sidebarCollapse'}
                    className='sidebar-collapse'
                    onClick={handleClose}
                >
                    <FormattedMessage
                        id='generic_icons.back'
                        defaultMessage='Back Icon'
                    >
                        {(title: string) => (
                            <span
                                className='fa fa-2x fa-angle-left'
                                title={title}
                            />
                        )}
                    </FormattedMessage>
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
                keepFocussed={keepInputFocussed}
                isFocussed={focussed}
                suggestionProviders={suggestionProviders}
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
                    updateSearchTerms={handleUpdateSearchTerms}
                    isSideBarExpanded={props.isRhsExpanded}
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

export default Search;
