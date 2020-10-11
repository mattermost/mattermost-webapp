// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, useEffect, useState, useRef} from 'react';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';

import Constants, {searchHintOptions, RHSStates} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import SearchChannelProvider from 'components/suggestion/search_channel_provider.jsx';
import SearchSuggestionList from 'components/suggestion/search_suggestion_list.jsx';
import SuggestionDate from 'components/suggestion/suggestion_date.jsx';
import SearchUserProvider from 'components/suggestion/search_user_provider.jsx';
import SearchDateProvider from 'components/suggestion/search_date_provider.jsx';
import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import HeaderIconWrapper from 'components/channel_header/components/header_icon_wrapper';
import SearchHint from 'components/search_hint/search_hint';
import FlagIcon from 'components/widgets/icons/flag_icon';
import MentionsIcon from 'components/widgets/icons/mentions_icon';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import Popover from 'components/widgets/popover';
import UserGuideDropdown from 'components/channel_header/components/user_guide_dropdown';

const {KeyCodes} = Constants;

const style = {
    searchForm: {overflow: 'visible'},
};

interface SearchHintOption {
    searchTerm: string,
    message: {
        id: string,
        defaultMessage: string,
    },
}

type Props = {
    isSearchingTerm?: boolean,
    searchTerms: string,
    isMentionSearch?: boolean,
    isFlaggedPosts?: boolean,
    showMentionFlagBtns?: boolean,
    isFocus?: boolean,
    isSideBarRight?: boolean,
    isRhsOpen?: boolean,
    getFocus?: (searchBarFocus: () => void) => void,
    actions: {
        updateSearchTerms: (term: string) => void,
        showSearchResults: (isMentionSearch: boolean) => Record<string, unknown>,
        showMentions: () => void,
        showFlaggedPosts: () => void,
        closeRightHandSide: () => void,
        autocompleteChannelsForSearch: (channelPrefix: string, callback: () => void) => void,
        autocompleteUsersInTeam: (usernamePrefix: string) => void,
        updateRhsState: (rhsState: string) => void,
    }
}

const SearchBar: React.FunctionComponent<Props> = (props: Props): JSX.Element => {
    // <editor-fold defaultstate="collapsed" desc="==> Component variables">

    const {actions, searchTerms} = props;

    const searchRef = useRef<SuggestionBox>();

    const suggestionProviders = [
        new SearchDateProvider(),
        new SearchChannelProvider(actions.autocompleteChannelsForSearch),
        new SearchUserProvider(actions.autocompleteUsersInTeam),
    ];

    // </editor-fold>

    // <editor-fold defaultstate="collapsed" desc="==> Component state">

    // generate intial component state and setters
    const [focussed, setFocussed] = useState<boolean>(false);
    const [keepInputFocussed, setKeepInputFocussed] = useState<boolean>(false);
    const [indexChangedViaKeyPress, setIndexChangedViaKeyPress] = useState<boolean>(false);
    const [highlightedSearchHintIndex, setHighlightedSearchHintIndex] = useState<number>(-1);
    const [visibleSearchHintOptions, setVisibleSearchHintOptions] = useState<SearchHintOption[]>(determineVisibleSearchHintOptions(searchTerms));

    // </editor-fold>

    // <editor-fold defaultstate="collapsed" desc="==> useEffect">

    useEffect((): void => {
        if (Utils.isMobile()) {
            setTimeout(() => {
                const element = document.querySelector('.app__body .sidebar--menu');
                if (element) {
                    element.classList.remove('visible');
                }
            });
        }
    }, []);

    useEffect((): void => {
        setVisibleSearchHintOptions(determineVisibleSearchHintOptions(searchTerms));
    }, [searchTerms]);

    // </editor-fold>

    // <editor-fold defaultstate="collapsed" desc="==> custom functions">

    // this specific function needs to be a function expression
    // because it is called while components initial state is generated
    function determineVisibleSearchHintOptions(_searchTerms: string): SearchHintOption[] {
        let vshOptions: SearchHintOption[] = [];

        if (_searchTerms.trim() === '') {
            vshOptions = searchHintOptions;
        } else {
            const pretextArray = _searchTerms.split(/\s+/g);
            const pretext = pretextArray[pretextArray.length - 1];
            const penultimatePretext = pretextArray[pretextArray.length - 2];

            const shouldShowHintOptions = penultimatePretext ? !searchHintOptions.some(({searchTerm}) => penultimatePretext.toLowerCase().endsWith(searchTerm.toLowerCase())) : !searchHintOptions.some(({searchTerm}) => _searchTerms.toLowerCase().endsWith(searchTerm.toLowerCase()));

            if (shouldShowHintOptions) {
                try {
                    vshOptions = searchHintOptions.filter((option) => {
                        return new RegExp(pretext, 'ig').test(option.searchTerm) && option.searchTerm.toLowerCase() !== pretext.toLowerCase();
                    });
                } catch {
                    vshOptions = [];
                }
            }
        }

        return vshOptions;
    }

    const handleClose = (): void => actions.closeRightHandSide?.();

    const handleUpdateSearchTerm = (term: string): void => {
        const pretextArray = searchTerms?.split(' ') || [];
        pretextArray.pop();
        pretextArray.push(term.toLowerCase());
        actions.updateSearchTerms(pretextArray.join(' '));
        focus();
        setHighlightedSearchHintIndex(-1);
        setIndexChangedViaKeyPress(false);
    };

    const handleKeyDown = (e: ChangeEvent<HTMLInputElement>): void => {
        if (Utils.isKeyPressed(e, KeyCodes.ESCAPE)) {
            searchRef.current?.blur();
            e.stopPropagation();
            e.preventDefault();
        }

        if (Utils.isKeyPressed(e, KeyCodes.DOWN)) {
            const newIndex = highlightedSearchHintIndex === visibleSearchHintOptions.length - 1 ? 0 : highlightedSearchHintIndex + 1;
            setHighlightedSearchHintIndex(newIndex);
            setIndexChangedViaKeyPress(true);
        }

        if (Utils.isKeyPressed(e, KeyCodes.UP)) {
            const newIndex = highlightedSearchHintIndex <= 0 ? visibleSearchHintOptions.length - 1 : highlightedSearchHintIndex - 1;
            setHighlightedSearchHintIndex(newIndex);
            setIndexChangedViaKeyPress(true);
        }

        if (Utils.isKeyPressed(e, KeyCodes.ENTER) && highlightedSearchHintIndex >= 0) {
            if (indexChangedViaKeyPress) {
                handleUpdateSearchTerm(visibleSearchHintOptions[highlightedSearchHintIndex].searchTerm);
                setKeepInputFocussed(true);
            }
        }

        if (Utils.isKeyPressed(e, KeyCodes.ENTER) && props.isMentionSearch) {
            actions.updateRhsState(RHSStates.SEARCH);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const term = e.target.value;
        actions.updateSearchTerms(term);
    };

    const handleUserBlur = (): void => {
        // add time out so that the pinned and member buttons are clickable
        // when focus is released from the search box.
        setTimeout(() => {
            if (keepInputFocussed) {
                setKeepInputFocussed(false);
            } else {
                setFocussed(false);
            }
        }, 0);

        setHighlightedSearchHintIndex(-1);
    };

    const onClear = (): void => {
        if (props.isMentionSearch) {
            setKeepInputFocussed(false);
            actions.updateRhsState(RHSStates.SEARCH);
        }
        actions.updateSearchTerms('');
    };

    const handleUserFocus = (): void => {
        setFocussed(true);
    };

    const handleSearch = async (terms: string): Promise<void> => {
        if (terms.length) {
            const {error} = await actions.showSearchResults?.(Boolean(props.isMentionSearch));

            if (!error) {
                handleSearchOnSuccess();
            }
        }
    };

    const handleSearchOnSuccess = (): void => {
        if (Utils.isMobile()) {
            // searchRef.current.value = '';
            searchRef.current?.clear();
        }
    };

    const handleSubmit = (e: ChangeEvent<HTMLFormElement>): void => {
        e.preventDefault();
        const terms = searchTerms.trim();

        if (terms.length === 0) {
            return;
        }

        handleSearch(terms);

        searchRef.current?.blur();
    };

    const focus = () => {
        // This is to allow redux to process the search term change
        setTimeout(() => {
            searchRef.current?.focus();
            setFocussed(true);
        }, 0);
    };

    const getSearch = (node: SuggestionBox): void => {
        searchRef.current = node;
        if (props.getFocus) {
            props.getFocus(focus);
        }
    };

    const keepInputFocused = (): void => {
        setKeepInputFocussed(true);
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

    // </editor-fold>

    // <editor-fold defaultstate="collapsed" desc="==> child-component rendering">

    let mentionBtn;
    let flagBtn;
    let userGuideBtn;

    if (props.showMentionFlagBtns) {
        mentionBtn = (
            <HeaderIconWrapper
                iconComponent={
                    <MentionsIcon
                        className='icon icon--standard'
                        aria-hidden='true'
                    />
                }
                ariaLabel={true}
                buttonClass={classNames('channel-header__icon', {
                    'channel-header__icon--active': props.isMentionSearch,
                })}
                buttonId={props.isSideBarRight ? 'sbrChannelHeaderMentionButton' : 'channelHeaderMentionButton'}
                onClick={searchMentions}
                tooltipKey={'recentMentions'}
                isRhsOpen={props.isRhsOpen}
            />
        );

        const flagBtnClass = props.isFlaggedPosts ? 'channel-header__icon--active' : '';

        flagBtn = (
            <HeaderIconWrapper
                iconComponent={
                    <FlagIcon className='icon icon--standard'/>
                }
                ariaLabel={true}
                buttonClass={'channel-header__icon ' + flagBtnClass}
                buttonId={props.isSideBarRight ? 'sbrChannelHeaderFlagButton' : 'channelHeaderFlagButton'}
                onClick={getFlagged}
                tooltipKey={'flaggedPosts'}
                isRhsOpen={props.isRhsOpen}
            />
        );

        userGuideBtn = (<UserGuideDropdown/>);
    }

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
                        onOptionSelected={handleUpdateSearchTerm}
                        onMouseDown={keepInputFocused}
                        highlightedIndex={highlightedSearchHintIndex}
                        onOptionHover={setHoverHintIndex}
                    />
                </Popover>
            );
        }

        return <></>;
    };

    // </editor-fold>

    const searchFormClass = `search__form${focussed ? ' search__form--focused' : ''}`;

    return (
        <div className='sidebar-right__table'>
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
            <div
                id={props.isSideBarRight ? 'sbrSearchFormContainer' : 'searchFormContainer'}
                className='search-form__container'
            >
                <form
                    role='application'
                    className={searchFormClass}
                    onSubmit={handleSubmit}
                    style={style.searchForm}
                    autoComplete='off'
                    aria-labelledby='searchBox'
                >
                    <div className='search__font-icon TEST'>
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
                        aria-label={Utils.localizeMessage('search_bar.search', 'Search')}
                        placeholder={Utils.localizeMessage('search_bar.search', 'Search')}
                        value={props.searchTerms}
                        onFocus={handleUserFocus}
                        onBlur={handleUserBlur}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        listComponent={SearchSuggestionList}
                        dateComponent={SuggestionDate}
                        providers={suggestionProviders}
                        type='search'
                        autoFocus={props.isFocus && searchTerms === ''}
                        delayInputUpdate={true}
                        renderDividers={true}
                        clearable={true}
                        onClear={onClear}
                    />
                    {props.isSearchingTerm && <LoadingSpinner/>}
                    {!Utils.isMobile() && renderHintPopover()}
                </form>
            </div>
            {mentionBtn}
            {flagBtn}
            {userGuideBtn}
        </div>
    );
};

const defaultProps: Partial<Props> = {
    searchTerms: '',
    showMentionFlagBtns: true,
    isFocus: false,
};

SearchBar.defaultProps = defaultProps;

export default SearchBar;
