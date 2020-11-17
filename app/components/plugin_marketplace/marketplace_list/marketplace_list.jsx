// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import MarketplaceItem from '../marketplace_item';

import NavigationRow from './navigation_row';

const PLUGINS_PER_PAGE = 15;

export default class MarketplaceList extends React.PureComponent {
    static propTypes = {
        plugins: PropTypes.array.isRequired,
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

    nextPage = () => {
        this.setState((state) => ({
            page: state.page + 1,
        }));
    };

    previousPage = () => {
        this.setState((state) => ({
            page: state.page - 1,
        }));
    };

    render() {
        const pageStart = this.state.page * PLUGINS_PER_PAGE;
        const pageEnd = pageStart + PLUGINS_PER_PAGE;
        const pluginsToDisplay = this.props.plugins.slice(pageStart, pageEnd);

        return (
            <div className='more-modal__list'>
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
                        labels={p.labels}
                        iconData={p.icon_data}
                        installedVersion={p.installed_version}
                    />
                ))}
                <NavigationRow
                    page={this.state.page}
                    total={this.props.plugins.length}
                    maximumPerPage={PLUGINS_PER_PAGE}
                    onNextPageButtonClick={this.nextPage}
                    onPreviousPageButtonClick={this.previousPage}
                />
            </div>
        );
    }
}
