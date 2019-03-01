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
                id='teamHeader'
                className='SidebarHeader team__header theme'
            >
                <SidebarHeaderDropdown/>
                {!this.state.isMobile && <StatusDropdown/>}
            </div>
        );
    }
}
