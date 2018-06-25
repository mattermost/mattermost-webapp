// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {requestCategoriesList, requestCategoriesListIfNeeded, saveSearchBarText, saveSearchScrollPosition, searchTextUpdate} from 'mattermost-redux/actions/gifs';
import {changeOpacity, makeStyleFromTheme} from 'mattermost-redux/utils/theme_utils';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import store from 'stores/redux_store.jsx';
import Constants from 'utils/constants';

import InfiniteScroll from 'components/gif_picker/components/InfiniteScroll';

import './Categories.scss';

function mapStateToProps(state) {
    return {
        ...state.entities.gifs.categories,
        ...state.entities.gifs.cache,
        appProps: state.entities.gifs.app,
        searchText: state.entities.gifs.search.searchText,
        searchBarText: state.entities.gifs.search.searchBarText,
    };
}

const mapDispatchToProps = ({
    saveSearchBarText,
    saveSearchScrollPosition,
    searchTextUpdate,
    requestCategoriesList,
    requestCategoriesListIfNeeded,
});

const getStyle = makeStyleFromTheme((theme) => {
    return {
        background: {
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.05),
        },
    };
});

export class Categories extends Component {
    static propTypes = {
        appProps: PropTypes.object,
        gifs: PropTypes.object,
        hasMore: PropTypes.bool,
        onSearch: PropTypes.func,
        onTrending: PropTypes.func,
        requestCategoriesList: PropTypes.func,
        requestCategoriesListIfNeeded: PropTypes.func,
        saveSearchBarText: PropTypes.func,
        saveSearchScrollPosition: PropTypes.func,
        searchTextUpdate: PropTypes.func,
        searchBarText: PropTypes.string,
        tagsList: PropTypes.array,
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        this.props.requestCategoriesListIfNeeded();
        this.sendImpressions();
    }

    sendImpressions = () => {
        const {tagsList, appProps} = this.props;
        const gfycats = tagsList.map((tag) => {
            return {gfyId: tag.gfyId};
        });

        if (gfycats.length) {
            trackEvent('gfycat', 'views', {context: 'category_list', count: gfycats.length});
        }
    }

    componentWillUnmount() {
        this.props.saveSearchScrollPosition(0);
    }

    filterTagsList = () => {
        const {searchBarText, tagsList} = this.props;

        const substr = searchBarText.toLowerCase().trim().split(/ +/).join(' ');
        return tagsList && tagsList.length ? tagsList.filter((tag) => {
            if (!searchBarText || tag.tagName.indexOf(substr) !== -1) {
                return tag;
            }
            return '';
        }) : [];
    }

    loadMore = () => {
        this.props.requestCategoriesList();
    }

    render() {
        const prefs = store.getState().entities.preferences.myPreferences;
        const theme = 'theme--' in prefs ? JSON.parse(prefs['theme--'].value) : Constants.THEMES.default;
        const style = getStyle(theme);

        const {hasMore, tagsList, gifs, onSearch, onTrending} = this.props;

        const content = tagsList && tagsList.length ? this.filterTagsList(tagsList).map((item, index) => {
            const {tagName, gfyId} = item;

            if (!gifs[gfyId]) {
                return null;
            }

            const gfyItem = gifs[gfyId];
            const {max1mbGif, avgColor} = gfyItem;
            const searchText = tagName.replace(/\s/g, '-');
            const backgroundImage = {backgroundImage: `url(${max1mbGif}`};
            const backgroundColor = {backgroundColor: avgColor};
            const props = this.props;
            function callback() {
                props.searchTextUpdate(tagName);
                props.saveSearchBarText(tagName);
                if (searchText === 'trending') {
                    onTrending();
                } else {
                    onSearch();
                }
            }
            return (
                <a
                    onClick={callback}
                    key={index}
                >
                    <div className='category-container'>
                        <div
                            className='category'
                            style={{...backgroundImage, ...backgroundColor}}
                        >
                            <div className='category-name'>{tagName}</div>
                        </div>
                    </div>
                </a>
            );
        }) : [];

        return content && content.length ? (
            <div
                className='categories-container'
                style={style.background}
            >
                <InfiniteScroll
                    hasMore={hasMore}
                    loadMore={this.loadMore}
                    threshold={1}
                >
                    {content}
                </InfiniteScroll>
            </div>
        ) : (
            <div
                className='categories-container'
                style={style.background}
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Categories);
