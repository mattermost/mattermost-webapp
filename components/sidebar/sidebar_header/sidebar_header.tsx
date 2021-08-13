// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import * as Utils from 'utils/utils.jsx';
import StatusDropdown from 'components/status_dropdown';

import SidebarHeaderDropdown from './dropdown';

const GlobalSidebarHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 8px 16px;
`;

const TeamName = styled.h1`
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    margin: 0;
    margin-left: 6px;
    color: var(--sidebar-header-text-color);
`;

type Props = {
    globalHeaderEnabled: boolean;
    teamDisplayName: string;
    teamId: string;
}

type State = {
    isMobile: boolean;
}

export default class SidebarHeader extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isMobile: Utils.isMobile(),
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize = () => {
        const isMobile = Utils.isMobile();
        this.setState({isMobile});
    }

    render() {
        const ariaLabel = Utils.localizeMessage('accessibility.sections.lhsHeader', 'team menu region');

        return this.props.globalHeaderEnabled ? (
            <GlobalSidebarHeader>
                <TeamName
                    id='headerTeamName'
                    data-teamid={this.props.teamId}
                >
                    {this.props.teamDisplayName}
                </TeamName>
                <SidebarHeaderDropdown/>
            </GlobalSidebarHeader>
        ) : (
            <div
                id='lhsHeader'
                aria-label={ariaLabel}
                tabIndex={-1}
                role='application'
                className='SidebarHeader team__header theme a11y__region'
                data-a11y-sort-order='5'
            >
                <div
                    className='d-flex'
                >
                    {!this.state.isMobile && !this.props.globalHeaderEnabled && <StatusDropdown/>}
                    <SidebarHeaderDropdown/>
                </div>
            </div>
        );
    }
}
