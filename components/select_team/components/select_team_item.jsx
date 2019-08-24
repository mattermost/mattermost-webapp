// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {intlShape} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import TeamInfoIcon from 'components/widgets/icons/team_info_icon';
import * as Utils from 'utils/utils.jsx';

export default class SelectTeamItem extends React.PureComponent {
    static propTypes = {
        team: PropTypes.object.isRequired,
        onTeamClick: PropTypes.func.isRequired,
        loading: PropTypes.bool.isRequired,
        canJoinPublicTeams: PropTypes.bool.isRequired,
        canJoinPrivateTeams: PropTypes.bool.isRequired,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    handleTeamClick = (e) => {
        e.preventDefault();
        this.props.onTeamClick(this.props.team);
    }

    renderDescriptionTooltip = () => {
        const team = this.props.team;
        if (!team.description) {
            return null;
        }

        const descriptionTooltip = (
            <Tooltip id='team-description__tooltip'>
                {team.description}
            </Tooltip>
        );

        return (
            <OverlayTrigger
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

    render() {
        const {formatMessage} = this.context.intl;
        const {canJoinPublicTeams, canJoinPrivateTeams, loading, team} = this.props;
        let icon;
        if (loading) {
            icon = (
                <span
                    className='fa fa-refresh fa-spin right signup-team__icon'
                    title={formatMessage({id: 'generic_icons.loading', defaultMessage: 'Loading Icon'})}
                />
            );
        } else {
            icon = (
                <span
                    className='fa fa-angle-right right signup-team__icon'
                    title={formatMessage({id: 'select_team.join.icon', defaultMessage: 'Join Team Icon'})}
                />
            );
        }

        const canJoin = (team.allow_open_invite && canJoinPublicTeams) || (!team.allow_open_invite && canJoinPrivateTeams);

        return (
            <div className='signup-team-dir'>
                {this.renderDescriptionTooltip()}
                <a
                    href='#'
                    id={Utils.createSafeId(team.display_name)}
                    onClick={canJoin ? this.handleTeamClick : null}
                    className={canJoin ? '' : 'disabled'}
                >
                    <span className='signup-team-dir__name'>{team.display_name}</span>
                    {!team.allow_open_invite &&
                        <span
                            className='fa fa-lock light'
                            title={formatMessage({id: 'select_team.private.icon', defaultMessage: 'Private team'})}
                        />}
                    {canJoin && icon}
                </a>
            </div>
        );
    }
}
