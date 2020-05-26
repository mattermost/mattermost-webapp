// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import App from 'components/gif_picker/components/App';
import Categories from 'components/gif_picker/components/Categories';
import Search from 'components/gif_picker/components/Search';
import Trending from 'components/gif_picker/components/Trending';
import constants from 'components/gif_picker/utils/constants';

export const appProps = {
    appName: constants.appName.mattermost,
    basePath: '/mattermost',
    itemTapType: constants.ItemTapAction.SHARE,
    appClassName: 'gfycat',
    shareEvent: 'shareMattermost',
    appId: 'mattermostwebviews',
    enableHistory: true,
    header: {
        tabs: [constants.Tab.TRENDING, constants.Tab.REACTIONS],
        displayText: false,
    },
};

export default class GifPicker extends React.PureComponent {
    static propTypes = {
        onGifClick: PropTypes.func.isRequired,
        defaultSearchText: PropTypes.string,
        handleSearchTextChange: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        const action = props.defaultSearchText ? 'search' : 'trending';
        this.state = {
            action,
        };
    }

    handleTrending = () => {
        this.setState({
            action: 'trending',
        });
    }

    handleCategories = () => {
        this.setState({
            action: 'reactions',
        });
    }

    handleSearch = () => {
        this.setState({
            action: 'search',
        });
    }

    handleItemClick = (gif) => {
        this.props.onGifClick(gif.max5mbGif);
    }

    render() {
        const {action} = this.state;
        let component;
        switch (action) {
        case 'reactions':
            component = (
                <Categories
                    appProps={appProps}
                    onTrending={this.handleTrending}
                    onSearch={this.handleSearch}
                />
            );
            break;
        case 'search':
            component = (
                <Search
                    appProps={appProps}
                    onCategories={this.handleCategories}
                    handleItemClick={this.handleItemClick}
                />
            );
            break;
        case 'trending':
            component = (
                <Trending
                    appProps={appProps}
                    onCategories={this.handleCategories}
                    handleItemClick={this.handleItemClick}
                />
            );
            break;
        }
        return (
            <div>
                <App
                    appProps={appProps}
                    action={action}
                    onTrending={this.handleTrending}
                    onCategories={this.handleCategories}
                    onSearch={this.handleSearch}
                    defaultSearchText={this.props.defaultSearchText}
                    handleSearchTextChange={this.props.handleSearchTextChange}
                >
                    {component}
                </App>
            </div>
        );
    }
}
