// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Popover, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
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
import LoadingSpinner from 'components/widgets/loading/loading_spinner.jsx';

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
        }, 200);
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
        if (Utils.isMobile()) {
            return null;
        }

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
                <SearchHint withTitle={true}/>
            </Popover>
        );
    }

    getSearch = (node) => {
        this.search = node;
    }

    render() {
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

        const showClear = !this.props.isSearchingTerm && this.props.searchTerms && this.props.searchTerms.trim() !== '';

        let searchFormClass = 'search__form';
        if (this.state.focused) {
            searchFormClass += ' focused';
        }

        const searchClearTooltip = (
            <Tooltip id='searchClearTooltip'>
                <FormattedMessage
                    id='search_bar.clear'
                    defaultMessage='Clear search query'
                />
            </Tooltip>
        );

        return (
            <div className='sidebar-right__table'>
                <div className='sidebar-collapse__container'>
                    <div
                        id='sidebarCollapse'
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
                    id='searchFormContainer'
                    className='search-form__container'
                >
                    <form
                        role='application'
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
                            ref={this.getSearch}
                            id='searchBox'
                            tabIndex='0'
                            className='search-bar a11y__region'
                            data-a11y-sort-order='8'
                            aria-describedby='searchbar-help-popup'
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
                        />
                        {showClear &&
                            <div
                                id='searchClearButton'
                                className='sidebar__search-clear visible'
                                onClick={this.handleClear}
                            >
                                <OverlayTrigger
                                    delayShow={Constants.OVERLAY_TIME_DELAY}
                                    placement='bottom'
                                    overlay={searchClearTooltip}
                                >
                                    <span
                                        className='sidebar__search-clear-x'
                                        aria-hidden='true'
                                    >
                                        {'×'}
                                    </span>
                                </OverlayTrigger>
                            </div>}
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
