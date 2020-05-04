// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';

import Constants, {searchHintOptions} from 'utils/constants';
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
import SearchIcon from 'components/widgets/icons/search_icon';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import Popover from 'components/widgets/popover';

const {KeyCodes} = Constants;

export default class SearchBar extends React.Component {
    static propTypes = {
        isSearchingTerm: PropTypes.bool,
        searchTerms: PropTypes.string,
        isMentionSearch: PropTypes.bool,
        isFlaggedPosts: PropTypes.bool,
        showMentionFlagBtns: PropTypes.bool,
        isFocus: PropTypes.bool,
        isSideBarRight: PropTypes.bool,
        isRhsOpen: PropTypes.bool,
        getFocus: PropTypes.func,
        actions: PropTypes.shape({
            updateSearchTerms: PropTypes.func,
            showSearchResults: PropTypes.func,
            showMentions: PropTypes.func,
            showFlaggedPosts: PropTypes.func,
            closeRightHandSide: PropTypes.func,
            autocompleteChannelsForSearch: PropTypes.func.isRequired,
            autocompleteUsersInTeam: PropTypes.func.isRequired,
        }),
    };

    static defaultProps = {
        showMentionFlagBtns: true,
        isFocus: false,
    };

    constructor(props) {
        super(props);

        this.state = {
            focused: false,
            keepInputFocused: false,
            index: -1,
            termsUsed: 0,
        };

        this.suggestionProviders = [
            new SearchDateProvider(),
            new SearchChannelProvider(props.actions.autocompleteChannelsForSearch),
            new SearchUserProvider(props.actions.autocompleteUsersInTeam),
        ];
    }

    componentDidMount() {
        if (Utils.isMobile()) {
            setTimeout(() => {
                const element = document.querySelector('.app__body .sidebar--menu');
                if (element) {
                    element.classList.remove('visible');
                }
            });
        }
    }

    handleClose = () => {
        this.props.actions.closeRightHandSide();
    }

    handleKeyDown = (e) => {
        const {index} = this.state;

        if (Utils.isKeyPressed(e, KeyCodes.ESCAPE)) {
            this.search.blur();
            e.stopPropagation();
            e.preventDefault();
        }

        if (Utils.isKeyPressed(e, KeyCodes.DOWN)) {
            const newIndex = index === searchHintOptions.length ? 0 : index + 1;
            this.setState({index: newIndex});
        }

        if (Utils.isKeyPressed(e, KeyCodes.UP)) {
            const newIndex = index <= 0 ? searchHintOptions.length - 1 : index - 1;
            this.setState({index: newIndex});
        }

        if (Utils.isKeyPressed(e, KeyCodes.ENTER) && index >= 0) {
            this.handleUpdateSearchTerm(searchHintOptions[index].searchTerm);
            this.setState({keepInputFocused: true});
        }
    }

    handleChange = (e) => {
        var term = e.target.value;
        this.props.actions.updateSearchTerms(term);
    }

    handleUserBlur = () => {
        // add time out so that the pinned and member buttons are clickable
        // when focus is released from the search box.
        setTimeout(() => {
            if (this.state.keepInputFocused === true) {
                this.setState({keepInputFocused: false});
            } else {
                this.setState({focused: false});
            }
        }, 0);

        this.setState({iindex: -1});
    }

    onClear = () => {
        this.props.actions.updateSearchTerms('');
        if (this.props.isMentionSearch) {
            this.setState({keepInputFocused: false});
        }
        this.setState({termsUsed: 0});
    }

    handleUserFocus = () => {
        this.setState({focused: true});
    }

    handleSearch = async (terms) => {
        if (terms.length) {
            const {error} = await this.props.actions.showSearchResults();

            if (!error) {
                this.handleSearchOnSuccess();
            }
        }
    }

    handleSearchOnSuccess = () => {
        if (Utils.isMobile() && this.search) {
            this.search.value = '';
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const terms = this.props.searchTerms.trim();

        if (terms.length === 0) {
            return;
        }

        this.handleSearch(terms);

        this.search.blur();
    }

    searchMentions = (e) => {
        e.preventDefault();
        if (this.props.isMentionSearch) {
            // Close
            this.props.actions.closeRightHandSide();
        } else {
            this.props.actions.showMentions();
        }
    }

    getFlagged = (e) => {
        e.preventDefault();
        if (this.props.isFlaggedPosts) {
            this.props.actions.closeRightHandSide();
        } else {
            this.props.actions.showFlaggedPosts();
        }
    }

    handleUpdateSearchTerm = (term) => {
        if (this.state.termsUsed === 0) {
            this.props.actions.updateSearchTerms(term.toLowerCase());
        } else {
            const pretextArray = this.props.searchTerms.split(' ');
            pretextArray.pop();
            pretextArray.push(term.toLowerCase());
            this.props.actions.updateSearchTerms(pretextArray.join(' '));
        }

        this.focus();
        this.setState({index: -1});
        this.setState({termsUsed: this.state.termsUsed + 1});
    }

    focus = () => {
        // This is to allow redux to process the search term change
        setTimeout(() => {
            this.search.focus();
            this.setState({focused: true});
        }, 0);

        if (this.search.value === '""') {
            // we need to move the cursor between the quotes since the user will need to type a matching phrase
            this.search.selectionStart = this.search.length - 1;
            this.search.selectionEnd = this.search.length - 1;
        } else {
            this.search.selectionStart = this.search.length;
        }
    }

    keepInputFocused = () => {
        this.setState({keepInputFocused: true});
    }

    setHoverHintIndex = (index) => {
        this.setState({index});
    }

    renderHintPopover() {
        if (Utils.isMobile()) {
            return null;
        }

        let filteredOptions;
        const pretextArray = this.props.searchTerms.split(' ');
        const pretext = pretextArray[pretextArray.length - 1];
        try {
            filteredOptions = searchHintOptions.filter((option) => new RegExp(pretext, 'ig').test(option.searchTerm) && option.searchTerm.toLowerCase() !== pretext.toLowerCase());
        } catch {
            filteredOptions = [];
        }

        if (filteredOptions.length > 0 && !this.props.isMentionSearch) {
            let helpClass = 'search-help-popover';
            if (this.state.focused && this.state.termsUsed <= 1) {
                helpClass += ' visible';
            }

            return (
                <Popover
                    id={this.props.isSideBarRight ? 'sbr-searchbar-help-popup' : 'searchbar-help-popup'}
                    placement='bottom'
                    className={helpClass}
                >
                    <SearchHint
                        options={filteredOptions}
                        withTitle={true}
                        onOptionSelected={this.handleUpdateSearchTerm}
                        onMouseDown={this.keepInputFocused}
                        highlightedIndex={this.state.index}
                        onOptionHover={this.setHoverHintIndex}
                    />
                </Popover>
            );
        }

        return <></>;
    }

    getSearch = (node) => {
        this.search = node;
        if (this.props.getFocus) {
            this.props.getFocus(this.focus);
        }
    }

    render() {
        let mentionBtn;
        let flagBtn;
        if (this.props.showMentionFlagBtns) {
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
                        'channel-header__icon--active': this.props.isMentionSearch,
                    })}
                    buttonId={this.props.isSideBarRight ? 'sbrChannelHeaderMentionButton' : 'channelHeaderMentionButton'}
                    onClick={this.searchMentions}
                    tooltipKey={'recentMentions'}
                    isRhsOpen={this.props.isRhsOpen}
                />
            );

            var flagBtnClass = this.props.isFlaggedPosts ? 'channel-header__icon--active' : '';

            flagBtn = (
                <HeaderIconWrapper
                    iconComponent={
                        <FlagIcon className='icon icon--standard'/>
                    }
                    ariaLabel={true}
                    buttonClass={'channel-header__icon ' + flagBtnClass}
                    buttonId={this.props.isSideBarRight ? 'sbrChannelHeaderFlagButton' : 'channelHeaderFlagButton'}
                    onClick={this.getFlagged}
                    tooltipKey={'flaggedPosts'}
                    isRhsOpen={this.props.isRhsOpen}
                />
            );
        }

        let searchFormClass = 'search__form';
        if (this.state.focused) {
            searchFormClass += ' search__form--focused';
        }

        return (
            <div className='sidebar-right__table'>
                <div className='sidebar-collapse__container'>
                    <div
                        id={this.props.isSideBarRight ? 'sbrSidebarCollapse' : 'sidebarCollapse'}
                        className='sidebar-collapse'
                        onClick={this.handleClose}
                    >
                        <FormattedMessage
                            id='generic_icons.back'
                            defaultMessage='Back Icon'
                        >
                            {(title) => (
                                <span
                                    className='fa fa-2x fa-angle-left'
                                    title={title}
                                />
                            )}
                        </FormattedMessage>
                    </div>
                </div>
                <div
                    id={this.props.isSideBarRight ? 'sbrSearchFormContainer' : 'searchFormContainer'}
                    className='search-form__container'
                >
                    <form
                        role='application'
                        className={searchFormClass}
                        onSubmit={this.handleSubmit}
                        style={style.searchForm}
                        autoComplete='off'
                        aria-labelledby='searchBox'
                    >
                        <SearchIcon
                            className='search__icon'
                            aria-hidden='true'
                        />
                        <SuggestionBox
                            ref={this.getSearch}
                            id={this.props.isSideBarRight ? 'sbrSearchBox' : 'searchBox'}
                            tabIndex='0'
                            className='search-bar a11y__region'
                            containerClass='w-full'
                            data-a11y-sort-order='9'
                            aria-describedby={this.props.isSideBarRight ? 'sbr-searchbar-help-popup' : 'searchbar-help-popup'}
                            aria-label={Utils.localizeMessage('search_bar.search', 'Search')}
                            placeholder={Utils.localizeMessage('search_bar.search', 'Search')}
                            value={this.props.searchTerms}
                            onFocus={this.handleUserFocus}
                            onBlur={this.handleUserBlur}
                            onChange={this.handleChange}
                            onKeyDown={this.handleKeyDown}
                            listComponent={SearchSuggestionList}
                            dateComponent={SuggestionDate}
                            providers={this.suggestionProviders}
                            type='search'
                            autoFocus={this.props.isFocus && this.props.searchTerms === ''}
                            delayInputUpdate={true}
                            renderDividers={true}
                            clearable={true}
                            onClear={this.onClear}
                        />
                        {this.props.isSearchingTerm && <LoadingSpinner/>}
                        {this.renderHintPopover()}
                    </form>
                </div>
                {mentionBtn}
                {flagBtn}
            </div>
        );
    }
}

const style = {
    searchForm: {overflow: 'visible'},
};
