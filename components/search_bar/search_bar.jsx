// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Popover} from 'react-bootstrap';
<<<<<<< HEAD

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
=======
import {FormattedMessage} from 'react-intl';
>>>>>>> Modify messages with many html tags to markdown style

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import SearchChannelProvider from 'components/suggestion/search_channel_provider.jsx';
import SearchSuggestionList from 'components/suggestion/search_suggestion_list.jsx';
import SuggestionDate from 'components/suggestion/suggestion_date.jsx';
import SearchUserProvider from 'components/suggestion/search_user_provider.jsx';
import SearchDateProvider from '../suggestion/search_date_provider.jsx';
import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import HeaderIconWrapper from 'components/channel_header/components/header_icon_wrapper';
import FlagIcon from 'components/svg/flag_icon';
import MentionsIcon from 'components/svg/mentions_icon';
import SearchIcon from 'components/svg/search_icon';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

const {KeyCodes} = Constants;

export default class SearchBar extends React.Component {
    static propTypes = {
        isSearchingTerm: PropTypes.bool,
        searchTerms: PropTypes.string,
        isMentionSearch: PropTypes.bool,
        isFlaggedPosts: PropTypes.bool,
        showMentionFlagBtns: PropTypes.bool,
        isFocus: PropTypes.bool,
        actions: PropTypes.shape({
            updateSearchTerms: PropTypes.func,
            showSearchResults: PropTypes.func,
            showMentions: PropTypes.func,
            showFlaggedPosts: PropTypes.func,
            closeRightHandSide: PropTypes.func,
            closeWebrtc: PropTypes.func,
        }),
    };

    static defaultProps = {
        showMentionFlagBtns: true,
        isFocus: false,
    };

    constructor() {
        super();

        this.state = {
            focused: false,
        };

        this.suggestionProviders = [new SearchChannelProvider(), new SearchUserProvider(), new SearchDateProvider()];
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
        this.props.actions.closeWebrtc();
        this.props.actions.closeRightHandSide();
    }

    handleKeyDown = (e) => {
        if (Utils.isKeyPressed(e, KeyCodes.ESCAPE)) {
            e.stopPropagation();
            e.preventDefault();
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
            this.setState({focused: false});
        }, 100);
    }

    handleClear = () => {
        this.props.actions.updateSearchTerms('');
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

    renderHintPopover() {
        let helpClass = 'search-help-popover';
        if (!this.props.searchTerms && this.state.focused) {
            helpClass += ' visible';
        }

        return (
            <Popover
                id='searchbar-help-popup'
                placement='bottom'
                className={helpClass}
            >
                <FormattedMarkdownMessage
                    id='search_bar.usage'
                    defaultMessage='#### Search Options\n\n* Use **"quotation marks"** to search for phrases\n* Use **from:** to find posts from specific users and **in:** to find posts in specific channels\n* Use **on:** to find posts on a specific date\n* Use **before:** to find posts before a specific date\n* Use **after:** to find posts after a specific date'
                />
            </Popover>
        );
    }

    getSearch = (node) => {
        this.search = node;
    }

    render() {
        var isSearchingTerm = null;
        if (this.props.isSearchingTerm) {
            isSearchingTerm = (
                <span
                    className={'fa fa-spin fa-spinner'}
                    title={Utils.localizeMessage('generic_icons.searching', 'Searching Icon')}
                />
            );
        }

        let mentionBtn;
        let flagBtn;
        if (this.props.showMentionFlagBtns) {
            var mentionBtnClass = this.props.isMentionSearch ? 'active' : '';

            mentionBtn = (
                <HeaderIconWrapper
                    iconComponent={
                        <MentionsIcon
                            className='icon icon__mentions'
                            aria-hidden='true'
                        />
                    }
                    buttonClass={'channel-header__icon style--none ' + mentionBtnClass}
                    buttonId={'channelHeaderMentionButton'}
                    onClick={this.searchMentions}
                    tooltipKey={'recentMentions'}
                />
            );

            var flagBtnClass = this.props.isFlaggedPosts ? 'active' : '';

            flagBtn = (
                <HeaderIconWrapper
                    iconComponent={
                        <FlagIcon className='icon icon__flag'/>
                    }
                    buttonClass={'channel-header__icon style--none ' + flagBtnClass}
                    buttonId={'channelHeaderFlagButton'}
                    onClick={this.getFlagged}
                    tooltipKey={'flaggedPosts'}
                />
            );
        }

        let clearClass = 'sidebar__search-clear';
        if (!this.props.isSearchingTerm && this.props.searchTerms && this.props.searchTerms.trim() !== '') {
            clearClass += ' visible';
        }

        let searchFormClass = 'search__form';
        if (this.state.focused) {
            searchFormClass += ' focused';
        }

        return (
            <div className='sidebar-right__table'>
                <div className='sidebar-collapse__container'>
                    <div
                        className='sidebar-collapse'
                        onClick={this.handleClose}
                    >
                        <span
                            className='fa fa-chevron-left'
                            title={Utils.localizeMessage('generic_icons.back', 'Back Icon')}
                        />
                    </div>
                </div>
                <div
                    id='searchFormContainer'
                    className='search-form__container'
                >
                    <form
                        role='form'
                        className={searchFormClass}
                        onSubmit={this.handleSubmit}
                        style={style.searchForm}
                        autoComplete='off'
                    >
                        <SearchIcon
                            id='searchIcon'
                            className='search__icon'
                            aria-hidden='true'
                        />
                        <SuggestionBox
                            id='searchBox'
                            ref={this.getSearch}
                            className='search-bar'
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
                        />
                        <div
                            id='searchClearButton'
                            className={clearClass}
                            onClick={this.handleClear}
                        >
                            <span
                                className='sidebar__search-clear-x'
                                aria-hidden='true'
                            >
                                {'×'}
                            </span>
                        </div>
                        {isSearchingTerm}
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
