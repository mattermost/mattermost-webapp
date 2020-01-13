// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Tooltip} from 'react-bootstrap';

import LocalizedIcon from 'components/localized_icon';
import OverlayTrigger from 'components/overlay_trigger';
import TeamInfoIcon from 'components/widgets/icons/team_info_icon';

import {t} from 'utils/i18n';
import * as Utils from 'utils/utils.jsx';

export default class SelectTeamItem extends React.PureComponent {
    static propTypes = {
        team: PropTypes.object.isRequired,
        onTeamClick: PropTypes.func.isRequired,
        loading: PropTypes.bool.isRequired,
        canJoinPublicTeams: PropTypes.bool.isRequired,
        canJoinPrivateTeams: PropTypes.bool.isRequired,
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
                rootClose={true}
                container={this}
            >
                <TeamInfoIcon className='icon icon--info'/>
            </OverlayTrigger>
        );
    }

    render() {
        const {canJoinPublicTeams, canJoinPrivateTeams, loading, team} = this.props;
        let icon;
        if (loading) {
            icon = (
                <LocalizedIcon
                    className='fa fa-refresh fa-spin right signup-team__icon'
                    component='span'
                    title={{id: t('generic_icons.loading'), defaultMessage: 'Loading Icon'}}
                />
            );
        } else {
            icon = (
                <LocalizedIcon
                    className='fa fa-angle-right right signup-team__icon'
                    component='span'
                    title={{id: t('select_team.join.icon'), defaultMessage: 'Join Team Icon'}}
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
                        <LocalizedIcon
                            className='fa fa-lock light'
                            title={{id: t('select_team.private.icon'), defaultMessage: 'Private team'}}
                        />}
                    {canJoin && icon}
                </a>
            </div>
        );
    }
}
