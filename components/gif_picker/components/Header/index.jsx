// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {saveSearchBarText, searchTextUpdate} from 'mattermost-redux/actions/gifs';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {changeOpacity, makeStyleFromTheme} from 'mattermost-redux/utils/theme_utils';

import constants from 'components/gif_picker/utils/constants';
import SearchBar from 'components/gif_picker/components/SearchBar';
import GifTrendingIcon from 'components/widgets/icons/gif_trending_icon';
import GifReactionsIcon from 'components/widgets/icons/gif_reactions_icon';
import './Header.scss';

function mapStateToProps(state) {
    return {
        theme: getTheme(state),
    };
}

const mapDispatchToProps = ({
    saveSearchBarText,
    searchTextUpdate,
});

const getStyle = makeStyleFromTheme((theme) => {
    return {
        background: {
            backgroundColor: theme.centerChannelBg,
        },
        header: {
            borderBottomColor: changeOpacity(theme.centerChannelColor, 0.2),
        },
        icon: {
            fill: changeOpacity(theme.centerChannelColor, 0.3),
        },
        iconActive: {
            fill: theme.centerChannelColor,
        },
        iconHover: {
            fill: changeOpacity(theme.centerChannelColor, 0.8),
        },
    };
});

export class Header extends PureComponent {
    static propTypes = {
        action: PropTypes.string,
        appProps: PropTypes.object,
        saveSearchBarText: PropTypes.func,
        searchTextUpdate: PropTypes.func,
        theme: PropTypes.object.isRequired,
        defaultSearchText: PropTypes.string,
        handleSearchTextChange: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            hovering: '',
        };
    }

    render() {
        const style = getStyle(this.props.theme);

        return (
            <header
                className='header-container'
                style={style.background}
            >
                <SearchBar {...this.props}/>
                <nav
                    className='nav-bar'
                    style={style.header}
                >
                    {this.renderTabs(this.props, style)}
                </nav>
            </header>
        );
    }

    renderTabs(props, style) {
        const {appProps, onTrending, onCategories} = props;
        const {header} = appProps;
        return header.tabs.map((tab, index) => {
            let link;
            if (tab === constants.Tab.TRENDING) {
                link = this.renderTab('trending', onTrending, GifTrendingIcon, index, style);
            } else if (tab === constants.Tab.REACTIONS) {
                link = this.renderTab('reactions', onCategories, GifReactionsIcon, index, style);
            }
            return link;
        });
    }

    renderTab(name, callback, Icon, index, style) {
        var props = this.props;
        const {action} = props;
        function callbackWrapper() {
            props.searchTextUpdate('');
            props.saveSearchBarText('');
            callback();
        }
        return (
            <a
                onClick={callbackWrapper}
                onMouseOver={() => {
                    this.setState({hovering: name});
                }}
                onMouseOut={() => {
                    this.setState({hovering: ''});
                }}
                style={{cursor: 'pointer'}}
                key={index}
            >
                <div style={{paddingTop: '2px'}}>
                    <Icon
                        style={(() => {
                            if (this.state.hovering === name) {
                                return style.iconHover;
                            }
                            return action === name ? style.iconActive : style.icon;
                        })()}
                    />
                </div>
            </a>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
