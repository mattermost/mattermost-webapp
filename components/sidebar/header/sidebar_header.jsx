// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import {Constants} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import StatusDropdown from 'components/status_dropdown/index.jsx';
import MenuTutorialTip from 'components/tutorial/menu_tutorial_tip';

import SidebarHeaderDropdown from './dropdown';

export default class SidebarHeader extends React.PureComponent {
    static propTypes = {
        teamId: PropTypes.string.isRequired,
        teamDisplayName: PropTypes.string.isRequired,
        teamDescription: PropTypes.string.isRequired,
        teamName: PropTypes.string.isRequired,
        teamType: PropTypes.string.isRequired,
        currentUser: PropTypes.object.isRequired,
        showTutorialTip: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            isMobile: Utils.isMobile(),
            showDropdown: false,
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

    toggleDropdown = (toggle) => {
        if (typeof (toggle) === 'boolean') {
            this.setState({
                showDropdown: toggle,
            });
        } else {
            this.setState({
                showDropdown: !this.state.showDropdown,
            });
        }
    }

    showDropdown = () => {
        this.toggleDropdown(true);
    }

    renderStatusDropdown = () => {
        if (this.state.isMobile) {
            return null;
        }
        return (
            <StatusDropdown/>
        );
    }

    render() {
        const statusDropdown = this.renderStatusDropdown();

        let tutorialTip = null;
        if (this.props.showTutorialTip) {
            tutorialTip = (
                <MenuTutorialTip
                    toggleFunc={this.showDropdown}
                    onBottom={false}
                />
            );
        }

        let teamNameWithToolTip = null;
        if (this.props.teamDescription === '') {
            teamNameWithToolTip = (
                <h1
                    id='headerTeamName'
                    className='team__name'
                >
                    {this.props.teamDisplayName}
                </h1>
            );
        } else {
            teamNameWithToolTip = (
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={<Tooltip id='team-name__tooltip'>{this.props.teamDescription}</Tooltip>}
                    ref='descriptionOverlay'
                >
                    <h1
                        id='headerTeamName'
                        className='team__name'
                    >
                        {this.props.teamDisplayName}
                    </h1>
                </OverlayTrigger>
            );
        }

        return (
            <div
                id='teamHeader'
                className='team__header theme'
            >
                {tutorialTip}
                <div
                    id='headerInfo'
                    className='header__info'
                >
                    {teamNameWithToolTip}
                    <div
                        id='headerUsername'
                        className='user__name'
                    >
                        {'@' + this.props.currentUser.username}
                    </div>
                </div>
                <div id='sidebarDropdownMenuContainer'>
                    <SidebarHeaderDropdown
                        teamId={this.props.teamId}
                        teamType={this.props.teamType}
                        teamDisplayName={this.props.teamDisplayName}
                        teamName={this.props.teamName}
                        currentUser={this.props.currentUser}
                        showDropdown={this.state.showDropdown}
                        onToggleDropdown={this.toggleDropdown}
                    />
                </div>
                {statusDropdown}
            </div>
        );
    }
}
