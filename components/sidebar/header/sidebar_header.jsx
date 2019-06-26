// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import * as Utils from 'utils/utils.jsx';
import StatusDropdown from 'components/status_dropdown/index.jsx';

import SidebarHeaderDropdown from './dropdown';

export default class SidebarHeader extends React.PureComponent {
    constructor(props) {
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
        return (
            <div
                id='lhsHeader'
                aria-labelledby='team_menu_aria_label'
                tabIndex='-1'
                className='SidebarHeader team__header theme'
            >
                <h1
                    id='team_menu_aria_label'
                    className='hidden-label'
                >
                    {Utils.localizeMessage('accessibility.sections.lhsHeader', 'team menu region')}
                </h1>
                <div className='d-flex'>
                    {!this.state.isMobile && <StatusDropdown/>}
                    <SidebarHeaderDropdown/>
                </div>
            </div>
        );
    }
}
