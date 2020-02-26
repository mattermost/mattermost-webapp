// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

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
            page: state.page + 1
        }));
    };

    previousPage = () => {
        this.setState((state) => ({
            page: state.page - 1
        }));
    };

    renderCount = () => {
        const total = this.props.plugins.length;
        const startCount = this.state.page * PLUGINS_PER_PAGE;
        const endCount = Math.min(startCount + PLUGINS_PER_PAGE, this.props.plugins.length);

        return (
            <FormattedMessage
                id='marketplace_list.countTotalPage'
                defaultMessage='{startCount, number} - {endCount, number} {total, plural, one {plugin} other {plugins}} of {total, number} total'
                values={{
                    startCount: startCount + 1,
                    endCount,
                    total,
                }}
            />
        );
    };

    render() {
        const pageStart = this.state.page * PLUGINS_PER_PAGE;
        const pageEnd = pageStart + PLUGINS_PER_PAGE;
        const pluginsToDisplay = this.props.plugins.slice(pageStart, pageEnd);
        const showNextPageButton = pluginsToDisplay.length >= PLUGINS_PER_PAGE && pageEnd < this.props.plugins.length;
        const showPreviousPageButton = this.state.page > 0;

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
                        iconData={p.icon_data}
                        installedVersion={p.installed_version}
                    />
                ))}
                <NavigationRow
                    countText={this.renderCount()}
                    onNextPageButtonClick={this.nextPage}
                    onPreviousPageButtonClick={this.previousPage}
                    showNextPageButton={showNextPageButton}
                    showPreviousPageButton={showPreviousPageButton}
                />
            </div>
        );
    }
}
