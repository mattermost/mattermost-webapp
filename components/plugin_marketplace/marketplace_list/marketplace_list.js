// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {FormattedMessage} from 'react-intl';

import {changeOpacity, makeStyleFromTheme} from 'mattermost-redux/utils/theme_utils';

import MarketplaceItem from '../marketplace_item';

const PLUGINS_PER_PAGE = 15;

export default class MarketplaceList extends React.PureComponent {
    static propTypes = {
        plugins: PropTypes.array.isRequired,
        theme: PropTypes.object.isRequired,
    };

    static getDerivedStateFromProps(props, state) {
        if (state.page > 0 && props.plugins.length < PLUGINS_PER_PAGE) {
            return {page: 0};
        }

        return null;
    }

    constructor(props) {
        super(props);

        this.state = {
            page: 0,
        };
    }

    nextPage = (e) => {
        e.preventDefault();
        this.setState({page: this.state.page + 1});
    };

    previousPage = (e) => {
        e.preventDefault();
        this.setState({page: this.state.page - 1});
    };

    renderCount = () => {
        const total = this.props.plugins.length;
        const count = this.props.plugins.length;
        const startCount = this.state.page * PLUGINS_PER_PAGE;
        const endCount = Math.min(startCount + PLUGINS_PER_PAGE, this.props.plugins.length);

        return (
            <FormattedMessage
                id='marketplace_list.countTotalPage'
                defaultMessage='{startCount, number} - {endCount, number} {count, plural, one {plugin} other {plugins}} of {total, number} total'
                values={{
                    count,
                    startCount: startCount + 1,
                    endCount,
                    total,
                }}
            />
        );
    };

    render() {
        const style = getStyle(this.props.theme);
        const pageStart = this.state.page * PLUGINS_PER_PAGE;
        const pageEnd = pageStart + PLUGINS_PER_PAGE;
        const pluginsToDisplay = this.props.plugins.slice(pageStart, pageEnd);
        let nextButton;
        let previousButton;
        if (pluginsToDisplay.length >= PLUGINS_PER_PAGE && pageEnd < this.props.plugins.length) {
            nextButton = (
                <button
                    id='marketplaceModalNextButton'
                    className='btn btn-link'
                    onClick={this.nextPage}
                >
                    <FormattedMessage
                        id='more_channels.next'
                        defaultMessage='Next'
                    />
                </button>
            );
        }
        if (this.state.page > 0) {
            previousButton = (
                <button
                    id='marketplaceModalPreviousButton'
                    className='btn btn-link'
                    onClick={this.previousPage}
                >
                    <FormattedMessage
                        id='more_channels.prev'
                        defaultMessage='Previous'
                    />
                </button>
            );
        }

        return (<div className='more-modal__list'>
            {pluginsToDisplay.map((p) => (
                <MarketplaceItem
                    key={p.manifest.id}
                    id={p.manifest.id}
                    name={p.manifest.name}
                    description={p.manifest.description}
                    version={p.manifest.version}
                    isPrepackaged={false}
                    downloadUrl={p.download_url}
                    homepageUrl={p.homepage_url}
                    releaseNotesUrl={p.release_notes_url}
                    iconData={p.icon_data}
                    installedVersion={p.installed_version}
                />
            ))}
            <div className='row'>
                <div className='col-xs-2'>
                    {previousButton}
                </div>
                <div
                    className='col-xs-8'
                    style={style.count}
                >
                    {this.renderCount()}
                </div>
                <div className='col-xs-2'>
                    {nextButton}
                </div>
            </div>
        </div>)
        ;
    }
}

const getStyle = makeStyleFromTheme((theme) => {
    return {
        count: {
            color: changeOpacity(theme.centerChannelColor, 0.6),
        },
    };
});
