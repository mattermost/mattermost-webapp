// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import TeamInfoIcon from 'components/svg/team_info_icon';
import * as Utils from 'utils/utils.jsx';

export default class SelectTeamItem extends React.PureComponent {
    static propTypes = {
        team: PropTypes.object.isRequired,
        onTeamClick: PropTypes.func.isRequired,
        loading: PropTypes.bool.isRequired,
    };

    handleTeamClick = (e) => {
        e.preventDefault();
        this.props.onTeamClick(this.props.team);
    }

    render() {
        let icon;
        if (this.props.loading) {
            icon = (
                <span
                    className='fa fa-refresh fa-spin right signup-team__icon'
                    title={Utils.localizeMessage('generic_icons.loading', 'Loading Icon')}
                />
            );
        } else {
            icon = (
                <span
                    className='fa fa-angle-right right signup-team__icon'
                    title={Utils.localizeMessage('select_team.join.icon', 'Join Team Icon')}
                />
            );
        }

        var descriptionTooltip = '';
        var showDescriptionTooltip = '';
        if (this.props.team.description) {
            descriptionTooltip = (
                <Tooltip id='team-description__tooltip'>
                    {this.props.team.description}
                </Tooltip>
            );

            showDescriptionTooltip = (
                <OverlayTrigger
                    trigger={['hover', 'focus', 'click']}
                    delayShow={1000}
                    placement='top'
                    overlay={descriptionTooltip}
                    ref='descriptionOverlay'
                    rootClose={true}
                    container={this}
                >
                    <TeamInfoIcon className='icon icon--info'/>
                </OverlayTrigger>
            );
        }

        return (
            <div className='signup-team-dir'>
                {showDescriptionTooltip}
                <a
                    href='#'
                    id={Utils.createSafeId(this.props.team.display_name)}
                    onClick={this.handleTeamClick}
                >
                    <span className='signup-team-dir__name'>{this.props.team.display_name}</span>
                    {icon}
                </a>
            </div>
        );
    }
}
