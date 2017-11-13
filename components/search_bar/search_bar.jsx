// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Popover, Tooltip} from 'react-bootstrap';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import SearchChannelProvider from '../suggestion/search_channel_provider.jsx';
import SearchSuggestionList from '../suggestion/search_suggestion_list.jsx';
import SearchUserProvider from '../suggestion/search_user_provider.jsx';
import SuggestionBox from '../suggestion/suggestion_box.jsx';

const {KeyCodes} = Constants;

export default class SearchBar extends React.Component {
    static propTypes = {
        searchTerm: PropTypes.string,
        isMentionSearch: PropTypes.bool,
        isFlaggedPosts: PropTypes.bool,
        actions: PropTypes.shape({
            searchPosts: PropTypes.func,
            showMentions: PropTypes.func,
            showFlaggedPosts: PropTypes.func,
            closeRightHandSide: PropTypes.func
        })
    };

    constructor() {
        super();
        this.mounted = false;

        this.state = {
            searchTerm: '',
            focused: false,
            isPristine: true
        };

        this.suggestionProviders = [new SearchChannelProvider(), new SearchUserProvider()];
    }

    componentDidMount() {
        this.mounted = true;

        if (Utils.isMobile()) {
            setTimeout(() => {
                document.querySelector('.app__body .sidebar--menu').classList.remove('visible');
            });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handleClose = () => {
        if (Utils.isMobile()) {
            setTimeout(() => {
                document.querySelector('.app__body .sidebar--menu').classList.add('visible');
            });
        }

        this.props.actions.closeRightHandSide();
    }

    handleKeyDown = (e) => {
        if (e.which === KeyCodes.ESCAPE) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    handleChange = (e) => {
        var term = e.target.value;
        this.setState({searchTerm: term});
    }

    handleUserBlur = () => {
        this.setState({focused: false});
    }

    handleClear = () => {
        this.setState({searchTerm: ''});
    }

    handleUserFocus = () => {
        this.setState({focused: true});
    }

    handleSearch = async (terms) => {
        if (terms.length) {
            this.setState({
                isSearching: true,
                isPristine: false
            });

            const {error} = await this.props.actions.searchPosts(terms);

            if (error) {
                this.handleSearchOnError();
            } else {
                this.handleSearchOnSuccess();
            }
        }
    }

    handleSearchOnSuccess = () => {
        if (this.mounted) {
            this.setState({isSearching: false});

            if (Utils.isMobile() && this.search) {
                this.search.value = '';
            }
        }
    }

    handleSearchOnError = () => {
        if (this.mounted) {
            this.setState({isSearching: false});
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const terms = this.state.searchTerm.trim();

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

    renderHintPopover(helpClass) {
        if (!this.props.isCommentsPage && Utils.isMobile() && this.state.isPristine) {
            return false;
        }

        return (
            <Popover
                id='searchbar-help-popup'
                placement='bottom'
                className={helpClass}
            >
                <FormattedHTMLMessage
                    id='search_bar.usage'
                    defaultMessage='<h4>Search Options</h4><ul><li><span>Use </span><b>"quotation marks"</b><span> to search for phrases</span></li><li><span>Use </span><b>from:</b><span> to find posts from specific users and </span><b>in:</b><span> to find posts in specific channels</span></li></ul>'
                />
            </Popover>
        );
    }

    render() {
        const flagIcon = Constants.FLAG_ICON_SVG;
        const searchIcon = Constants.SEARCH_ICON_SVG;
        const mentionsIcon = Constants.MENTIONS_ICON_SVG;

        var isSearching = null;
        if (this.state.isSearching) {
            isSearching = <span className={'fa fa-spin fa-spinner'}/>;
        }

        let helpClass = 'search-help-popover';
        if (!this.state.searchTerm && this.state.focused) {
            helpClass += ' visible';
        }

        const recentMentionsTooltip = (
            <Tooltip id='recentMentionsTooltip'>
                <FormattedMessage
                    id='channel_header.recentMentions'
                    defaultMessage='Recent Mentions'
                />
            </Tooltip>
        );

        const flaggedTooltip = (
            <Tooltip
                id='flaggedTooltip'
                className='text-nowrap'
            >
                <FormattedMessage
                    id='channel_header.flagged'
                    defaultMessage='Flagged Posts'
                />
            </Tooltip>
        );

        let mentionBtn;
        let flagBtn;
        if (this.props.showMentionFlagBtns) {
            var mentionBtnClass = this.props.isMentionSearch ? 'active' : '';

            mentionBtn = (
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={recentMentionsTooltip}
                >
                    <div
                        className={'channel-header__icon ' + mentionBtnClass}
                        onClick={this.searchMentions}
                    >
                        <span
                            className='icon icon__mentions'
                            dangerouslySetInnerHTML={{__html: mentionsIcon}}
                            aria-hidden='true'
                        />
                    </div>
                </OverlayTrigger>
            );

            var flagBtnClass = this.props.isFlaggedPosts ? 'active' : '';

            flagBtn = (
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={flaggedTooltip}
                >
                    <div
                        className={'channel-header__icon ' + flagBtnClass}
                    >
                        <button
                            onClick={this.getFlagged}
                            className='style--none'
                        >
                            <span
                                className='icon icon__flag'
                                dangerouslySetInnerHTML={{__html: flagIcon}}
                            />
                        </button>
                    </div>
                </OverlayTrigger>
            );
        }

        let clearClass = 'sidebar__search-clear';
        if (!this.state.isSearching && this.state.searchTerm && this.state.searchTerm.trim() !== '') {
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
                        <span className='fa fa-chevron-left'/>
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
                        style={{overflow: 'visible'}}
                        autoComplete='off'
                    >
                        <span
                            id='searchIcon'
                            className='search__icon'
                            dangerouslySetInnerHTML={{__html: searchIcon}}
                            aria-hidden='true'
                        />
                        <SuggestionBox
                            id='searchBox'
                            ref={(search) => {
                                this.search = search;
                            }}
                            className='search-bar'
                            placeholder={Utils.localizeMessage('search_bar.search', 'Search')}
                            value={this.state.searchTerm}
                            onFocus={this.handleUserFocus}
                            onBlur={this.handleUserBlur}
                            onChange={this.handleChange}
                            onKeyDown={this.handleKeyDown}
                            listComponent={SearchSuggestionList}
                            providers={this.suggestionProviders}
                            type='search'
                            autoFocus={this.props.isFocus && this.state.searchTerm === ''}
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
                        {isSearching}
                        {this.renderHintPopover(helpClass)}
                    </form>
                </div>
                <div>
                    {mentionBtn}
                </div>
                <div>
                    {flagBtn}
                </div>
            </div>
        );
    }
}

SearchBar.defaultProps = {
    showMentionFlagBtns: true,
    isFocus: false
};

SearchBar.propTypes = {
    showMentionFlagBtns: PropTypes.bool,
    isCommentsPage: PropTypes.bool,
    isFocus: PropTypes.bool
};
