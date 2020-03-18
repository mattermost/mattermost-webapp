// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants';
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

    onClear = () => {
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
                id={this.props.isSideBarRight ? 'sbr-searchbar-help-popup' : 'searchbar-help-popup'}
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
                    ariaLabel={true}
                    buttonClass={'channel-header__icon style--none ' + mentionBtnClass}
                    buttonId={this.props.isSideBarRight ? 'sbrChannelHeaderMentionButton' : 'channelHeaderMentionButton'}
                    onClick={this.searchMentions}
                    tooltipKey={'recentMentions'}
                    isRhsOpen={this.props.isRhsOpen}
                />
            );

            var flagBtnClass = this.props.isFlaggedPosts ? 'active' : '';

            flagBtn = (
                <HeaderIconWrapper
                    iconComponent={
                        <FlagIcon className='icon icon__flag'/>
                    }
                    ariaLabel={true}
                    buttonClass={'channel-header__icon style--none ' + flagBtnClass}
                    buttonId={this.props.isSideBarRight ? 'sbrChannelHeaderFlagButton' : 'channelHeaderFlagButton'}
                    onClick={this.getFlagged}
                    tooltipKey={'flaggedPosts'}
                    isRhsOpen={this.props.isRhsOpen}
                />
            );
        }

        let searchFormClass = 'search__form';
        if (this.state.focused) {
            searchFormClass += ' focused';
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
