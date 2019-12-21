// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {FormattedMessage} from 'react-intl';

import MarketplaceItem from './marketplace_item';

const PLUGINS_PER_PAGE = 15;

export class MarketplaceList extends React.PureComponent {
    static propTypes = {
        plugins: PropTypes.array.isRequired,
    };

    static getDerivedStateFromProps(props, state) {
        if (state.page > 0 && props.plugins.length < state.pluginsPerPage) {
            return {page: 0};
        }

        return null;
    }

    constructor(props) {
        super(props);

        this.state = {
            page: 0,
            pluginsPerPage: PLUGINS_PER_PAGE,
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
        const startCount = this.state.page * this.state.pluginsPerPage;
        const endCount = Math.min(startCount + this.state.pluginsPerPage, this.props.plugins.length);

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
        const pageStart = this.state.page * this.state.pluginsPerPage;
        const pageEnd = pageStart + this.state.pluginsPerPage;
        const pluginsToDisplay = this.props.plugins.slice(pageStart, pageEnd);
        let nextButton;
        let previousButton;
        if (pluginsToDisplay.length >= this.state.pluginsPerPage && pageEnd < this.props.plugins.length) {
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
            <div className='flex-parent'>
                <div className='flex-child'>
                    {previousButton}
                </div>
                <div className='flex-child'>
                    {this.renderCount()}
                </div>
                <div className='flex-child'>
                    {nextButton}
                </div>
            </div>
        </div>)
        ;
    }
}
