// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import SearchResultsHeader from 'components/search_results_header';

import Pluggable from 'plugins/pluggable';

export default class RhsPlugin extends React.PureComponent {
    static propTypes = {
        pluggableId: PropTypes.string.isRequired,
        title: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object,
        ]),
        icons: PropTypes.arrayOf(PropTypes.shape({
            icon: PropTypes.node.isRequired,
            tooltip: PropTypes.node.isRequired,
            action: PropTypes.func.isRequired,
        })),
    }

    render() {
        return (
            <div
                id='rhsContainer'
                className='sidebar-right__body'
            >
                <SearchResultsHeader
                    icons={this.props.icons}
                >
                    {this.props.title}
                </SearchResultsHeader>
                <Pluggable
                    pluggableName='RightHandSidebarComponent'
                    pluggableId={this.props.pluggableId}
                />
            </div>
        );
    }
}
