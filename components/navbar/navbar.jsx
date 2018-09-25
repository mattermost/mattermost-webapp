// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {MobileChannelHeaderDropdown} from 'components/channel_header_dropdown';
import MobileChannelHeaderPlug from 'plugins/mobile_channel_header_plug';

import CollapseLhsButton from './collapse_lhs_button';
import CollapseRhsButton from './collapse_rhs_button';
import NavbarInfoButton from './navbar_info_button';
import ShowSearchButton from './show_search_button';

export default class Navbar extends React.PureComponent {
    static propTypes = {

        /**
         * Object with info about current channel
         */
        channel: PropTypes.object,

        /**
         * Bool whether the current channel is read only
         */
        isReadOnly: PropTypes.bool,

        /**
         * Object with action creators
         */
        actions: PropTypes.shape({
            closeLhs: PropTypes.func.isRequired,
            closeRhs: PropTypes.func.isRequired,
            closeRhsMenu: PropTypes.func.isRequired,
        }).isRequired,
    };

    componentDidMount() {
        document.querySelector('.inner-wrap').addEventListener('click', this.hideSidebars);
    }

    componentWillUnmount() {
        document.querySelector('.inner-wrap').removeEventListener('click', this.hideSidebars);
    }

    hideSidebars = (e) => {
        const {outerWidth} = window;
        if (outerWidth <= 768) {
            this.props.actions.closeRhs();

            if (e.target.className !== 'navbar-toggle' && e.target.className !== 'icon-bar') {
                this.props.actions.closeLhs();
                this.props.actions.closeRhsMenu();
            }
        }
    }

    render() {
        const {channel} = this.props;

        return (
            <nav
                id='navbar'
                className='navbar navbar-default navbar-fixed-top'
                role='navigation'
            >
                <div className='container-fluid theme'>
                    <div className='navbar-header'>
                        <CollapseLhsButton/>
                        <CollapseRhsButton/>
                        <ShowSearchButton/>
                        {channel && (
                            <React.Fragment>
                                <NavbarInfoButton
                                    ref='headerOverlay'
                                    channel={channel}
                                    isReadOnly={this.props.isReadOnly}
                                />
                                <MobileChannelHeaderPlug
                                    channel={channel}
                                    isDropdown={false}
                                />
                                <MobileChannelHeaderDropdown/>
                            </React.Fragment>
                        )}
                    </div>
                </div>
            </nav>
        );
    }
}
