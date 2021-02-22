// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {MarketplacePlugin} from 'mattermost-redux/types/plugins';

import MarketplaceItem from '../marketplace_item';

import NavigationRow from './navigation_row';

const PLUGINS_PER_PAGE = 15;

type MarketplaceListProps = {
    plugins: MarketplacePlugin[];
};

type MarketplaceListState = {
    page: number;
};

export default class MarketplaceList extends React.PureComponent <MarketplaceListProps, MarketplaceListState> {
    static getDerivedStateFromProps(props: MarketplaceListProps, state: MarketplaceListState): MarketplaceListState | null {
        if (state.page > 0 && props.plugins.length < PLUGINS_PER_PAGE) {
            return {page: 0};
        }

        return null;
    }

    constructor(props: MarketplaceListProps) {
        super(props);

        this.state = {
            page: 0,
        };
    }

    nextPage = (): void => {
        this.setState((state) => ({
            page: state.page + 1,
        }));
    };

    previousPage = (): void => {
        this.setState((state) => ({
            page: state.page - 1,
        }));
    };

    render(): JSX.Element {
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
