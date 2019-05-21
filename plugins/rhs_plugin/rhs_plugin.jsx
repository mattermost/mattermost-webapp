// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import SearchResultsHeader from 'components/search_results_header';

import Pluggable from 'plugins/pluggable';

export default class RhsPlugin extends React.PureComponent {
    static propTypes = {
        title: PropTypes.object,
    }

    render() {
        return (
            <div
                id='rhsContainer'
                className='sidebar-right__body'
                ref='sidebarbody'
            >
                <SearchResultsHeader>
                    {this.props.title}
                </SearchResultsHeader>
                <Pluggable
                    pluggableName='RightHandSidebarComponent'
                    onHeightChange={this.handleHeightReceived}
                />
            </div>
        );
    }
}
