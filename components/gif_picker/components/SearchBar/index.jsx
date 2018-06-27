// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {saveSearchScrollPosition, saveSearchBarText, searchTextUpdate} from 'mattermost-redux/actions/gifs';
import {changeOpacity, makeStyleFromTheme} from 'mattermost-redux/utils/theme_utils';

import Constants from 'utils/constants';

import store from 'stores/redux_store.jsx';

import GifSearchIcon from 'components/svg/gif_search_icon';
import GifSearchClearIcon from 'components/svg/gif_search_clear_icon';

import './SearchBar.scss';

function mapStateToProps(state) {
    return {
        ...state.entities.gifs.categories,
        ...state.entities.gifs.search,
        appProps: state.entities.gifs.app,
    };
}

const mapDispatchToProps = ({
    saveSearchBarText,
    saveSearchScrollPosition,
    searchTextUpdate,
});

const getStyle = makeStyleFromTheme((theme) => {
    return {
        background: {
            backgroundColor: theme.centerChannelBg,
        },
        icon: {
            fill: changeOpacity(theme.centerChannelColor, 0.4),
        },
        inputBackground: {
            backgroundColor: theme.centerChannelBg,
        },
        input: {
            borderColor: changeOpacity(theme.centerChannelColor, 0.12),
            color: changeOpacity(theme.centerChannelColor, 0.6),
        },
        placeholder: {
            color: changeOpacity(theme.centerChannelColor, 0.6),
        },
    };
});

export class SearchBar extends Component {
    static propTypes = {
        searchBarText: PropTypes.string,
        tagsList: PropTypes.array,
        onTrending: PropTypes.func,
        onSearch: PropTypes.func,
        onCategories: PropTypes.func,
        action: PropTypes.string,
        saveSearchScrollPosition: PropTypes.func,
        saveSearchBarText: PropTypes.func,
        searchTextUpdate: PropTypes.func,
    }

    constructor(props) {
        super(props);

        this.state = {
            inputFocused: false,
        };

        this.searchTimeout = null;
        this.props.saveSearchBarText('');
        this.props.searchTextUpdate('');
    }

    componentDidUpdate(prevProps) {
        const {searchBarText} = this.props;

        if (searchBarText !== prevProps.searchBarText) {
            if (searchBarText === 'trending') {
                this.updateSearchInputValue('');
            } else {
                this.updateSearchInputValue(searchBarText);
            }
        }
    }

    /**
     * Returns text request with hyphens
     */
    parseSearchText = (searchText) => {
        return searchText.trim().split(/ +/).join('-');
    }

    removeExtraSpaces = (searchText) => {
        return searchText.trim().split(/ +/).join(' ');
    }

    updateSearchInputValue = (searchText) => {
        this.searchInput.value = searchText;
        this.props.saveSearchBarText(searchText);
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.triggerSearch(this.searchInput.value);
        this.searchInput.blur();
    }

    triggerSearch = (searchText) => {
        const {onSearch} = this.props;
        this.props.searchTextUpdate(this.parseSearchText(searchText));
        onSearch();
        this.props.saveSearchScrollPosition(0);
    }

    handleChange = (event) => {
        clearTimeout(this.searchTimeout);

        const searchText = event.target.value;

        const {onCategories, action} = this.props;
        this.props.saveSearchBarText(searchText);

        if (searchText === '') {
            onCategories();
        } else if (action !== 'reactions' || !this.isFilteredTags(searchText)) {
            // not reactions page or there's no reactions for this search request
            this.searchTimeout = setTimeout(() => {
                this.triggerSearch(searchText);
            }, 500);
        }
    }

    focusInput = () => {
        this.setState({inputFocused: true});
    }

    blurInput = () => {
        this.setState({inputFocused: false});
    }

    /**
     * Checks if there're reactions for a current searchText
     */
    isFilteredTags = (searchText) => {
        var text = this.removeExtraSpaces(searchText);

        const {tagsList} = this.props;
        const substr = text.toLowerCase();
        const filteredTags = tagsList && tagsList.length ? tagsList.filter((tag) => {
            if (!text || tag.tagName.indexOf(substr) !== -1) {
                return tag;
            }
            return '';
        }) : [];

        return Boolean(filteredTags.length);
    }

    clearSearchHandle = () => {
        const {action, onTrending, onCategories} = this.props;
        this.updateSearchInputValue('');
        if (action === 'reactions') {
            onCategories();
        } else {
            onTrending();
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return ((!nextProps.searchBarText && this.props.searchBarText) ||
            (nextProps.searchBarText && !this.props.searchBarText) ||
            (nextState.inputFocused !== this.state.inputFocused));
    }

    render() {
        const prefs = store.getState().entities.preferences.myPreferences;
        const theme = 'theme--' in prefs ? JSON.parse(prefs['theme--'].value) : Constants.THEMES.default;
        const style = getStyle(theme);
        const {searchBarText} = this.props;
        const clearSearchButton = searchBarText ?
            (
                <GifSearchClearIcon
                    className='ic-clear-search'
                    style={style.icon}
                    onClick={this.clearSearchHandle}
                />
            ) : null;

        const placeholder = !searchBarText && !this.state.inputFocused ?
            (
                <span
                    className='placeholder'
                    style={style.placeholder}
                >{'Search Gfycat'}</span>
            ) :
            null;

        return (
            <form
                className='search-form'
                method='get'
                target='_top'
                noValidate=''
                onSubmit={this.handleSubmit}
            >
                <div
                    className='search-bar'
                    style={style.background}
                >
                    <div
                        className='search-input-bg'
                        style={style.inputBackground}
                    />
                    {placeholder}
                    <input
                        className='search-input'
                        name='searchText'
                        onChange={this.handleChange}
                        autoComplete='off'
                        autoCapitalize='off'
                        onFocus={this.focusInput}
                        onBlur={this.blurInput}
                        ref={(input) => {
                            this.searchInput = input;
                            return input;
                        }}
                        style={style.input}
                    />
                    <GifSearchIcon
                        className='ic ic-search'
                        style={style.icon}
                    />
                    {clearSearchButton}
                </div>
                <button
                    type='submit'
                    className='submit-button'
                />
            </form>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);

