// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import SearchResultsHeader from 'components/search_results_header';
import {BoardsTourTip, PlaybooksTourTip} from 'components/tours/worktemplate_explore_tour';

import Pluggable from 'plugins/pluggable';

export default class RhsPlugin extends React.PureComponent {
    static propTypes = {
        showPluggable: PropTypes.bool.isRequired,
        pluggableId: PropTypes.string.isRequired,
        title: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object,
        ]),
        pluginId: PropTypes.string,
        showBoardsTour: PropTypes.bool,
        showPlaybooksTour: PropTypes.bool,
        boardsCount: PropTypes.string,
        playbooksCount: PropTypes.string,
    }

    render() {
        let tourTip = null;
        if (this.props.pluginId === 'boards' && this.props.showBoardsTour) {
            tourTip = (
                <BoardsTourTip
                    singleTip={false}
                    boardCount={this.props.boardsCount}
                />);
        } else if (this.props.pluginId === 'playbooks' && this.props.showPlaybooksTour) {
            tourTip = (
                <PlaybooksTourTip
                    singleTip={false}
                    playbookCount={this.props.playbooksCount}
                />);
        }
        return (
            <div
                id='rhsContainer'
                className='sidebar-right__body'
            >
                <SearchResultsHeader>
                    {this.props.title}
                </SearchResultsHeader>
                {
                    this.props.showPluggable &&
                    <>
                        <Pluggable
                            pluggableName='RightHandSidebarComponent'
                            pluggableId={this.props.pluggableId}
                        />
                        {tourTip}
                    </>
                }
            </div>
        );
    }
}
