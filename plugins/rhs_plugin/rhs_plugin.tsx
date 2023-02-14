// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import SearchResultsHeader from 'components/search_results_header';
import {BoardsTourTip, PlaybooksTourTip} from 'components/tours/worktemplate_explore_tour';

import Pluggable from 'plugins/pluggable';

export type Props = {
    showPluggable: boolean;
    pluggableId: string;
    title: string | React.ReactNode;
    workTemplateTourData: {
        showPlaybooksTour: boolean;
        showBoardsTour: boolean;
        boardsCount: number;
        playbooksCount: number;
    };
}

export default class RhsPlugin extends React.PureComponent<Props> {
    render() {
        const {
            showBoardsTour,
            showPlaybooksTour,
            boardsCount,
            playbooksCount,
        } = this.props.workTemplateTourData;

        let boardsTourTip = null;
        let playbooksTourtip = null;

        if (showBoardsTour) {
            boardsTourTip = (
                <BoardsTourTip
                    singleTip={Boolean(playbooksCount === 0)}
                    boardCount={String(boardsCount)}
                />);
        }
        if (showPlaybooksTour) {
            playbooksTourtip = (
                <PlaybooksTourTip
                    singleTip={Boolean(boardsCount === 0)}
                    playbookCount={String(playbooksCount)}
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
                        {boardsTourTip}
                        {playbooksTourtip}
                    </>
                }
            </div>
        );
    }
}
