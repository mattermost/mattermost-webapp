// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {injectIntl} from 'react-intl';
import {Link} from 'react-router-dom';

import {mark, trackEvent} from 'actions/diagnostics_actions.jsx';
import Constants from 'utils/constants';
import {intlShape} from 'utils/react_intl';
import {isDesktopApp} from 'utils/user_agent';
import {localizeMessage} from 'utils/utils.jsx';
import CopyUrlContextMenu from 'components/copy_url_context_menu';
import OverlayTrigger from 'components/overlay_trigger';
import TeamIcon from '../../widgets/team_icon/team_icon';

// eslint-disable-next-line react/require-optimization
class TeamButton extends React.Component {
    static propTypes = {
        btnClass: PropTypes.string,
        url: PropTypes.string.isRequired,
        displayName: PropTypes.string,
        content: PropTypes.node,
        tip: PropTypes.node.isRequired,
        active: PropTypes.bool,
        disabled: PropTypes.bool,
        unread: PropTypes.bool,
        mentions: PropTypes.number,
        placement: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
        teamIconUrl: PropTypes.string,
        switchTeam: PropTypes.func.isRequired,
        intl: intlShape.isRequired,
    };

    static defaultProps = {
        btnClass: '',
        tip: '',
        placement: 'right',
        active: false,
        disabled: false,
        unread: false,
        mentions: 0,
    };

    handleSwitch = (e) => {
        e.preventDefault();
        mark('TeamLink#click');
        trackEvent('ui', 'ui_team_sidebar_switch_team');
        this.props.switchTeam(this.props.url);
    }

    handleDisabled = (e) => {
        e.preventDefault();
    }

    render() {
        const {teamIconUrl, displayName, btnClass, mentions, unread} = this.props;
        const {formatMessage} = this.props.intl;

        let teamClass = this.props.active ? 'active' : '';
        const disabled = this.props.disabled ? 'team-disabled' : '';
        const handleClick = (this.props.active || this.props.disabled) ? this.handleDisabled : this.handleSwitch;
        let badge;

        let ariaLabel = formatMessage({
            id: 'team.button.ariaLabel',
            defaultMessage: '{teamName} team',
        },
        {
            teamName: displayName,
        });

        if (!teamClass) {
            teamClass = unread ? 'unread' : '';
            ariaLabel = formatMessage({
                id: 'team.button.unread.ariaLabel',
                defaultMessage: '{teamName} team unread',
            },
            {
                teamName: displayName,
            });

            if (mentions) {
                ariaLabel = formatMessage({
                    id: 'team.button.mentions.ariaLabel',
                    defaultMessage: '{teamName} team, {mentionCount} mentions',
                },
                {
                    teamName: displayName,
                    mentionCount: mentions,
                });

                badge = (
                    <span className={'badge pull-right small'}>{mentions}</span>
                );
            }
        }

        ariaLabel = ariaLabel.toLowerCase();

        const content = (
            <TeamIcon
                withHover={true}
                name={this.props.content || displayName}
                url={teamIconUrl}
            />
        );

        const toolTip = this.props.tip || localizeMessage('team.button.name_undefined', 'Name undefined');
        const btn = (
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement={this.props.placement}
                overlay={
                    <Tooltip id={`tooltip-${this.props.url}`}>
                        {toolTip}
                    </Tooltip>
                }
            >
                <div className={'team-btn ' + btnClass}>
                    {badge}
                    {content}
                </div>
            </OverlayTrigger>
        );

        let teamButton;
        if (isDesktopApp()) {
            teamButton = (
                <button
                    className={'btn btn-link ' + disabled}
                    onClick={handleClick}
                >
                    {btn}
                </button>
            );

            // if this is not a "special" team button, give it a context menu
            if (!this.props.url.endsWith('create_team') && !this.props.url.endsWith('select_team')) {
                teamButton = (
                    <CopyUrlContextMenu
                        link={this.props.url}
                        menuId={this.props.url}
                    >
                        {teamButton}
                    </CopyUrlContextMenu>
                );
            }
        } else {
            teamButton = (
                <Link
                    id={`${this.props.url.slice(1)}TeamButton`}
                    aria-label={ariaLabel}
                    className={disabled}
                    to={this.props.url}
                    onClick={handleClick}
                >
                    {btn}
                </Link>
            );
        }

        return (
            <div
                className={`team-container ${teamClass}`}
            >
                {teamButton}
            </div>
        );
    }
}

export default injectIntl(TeamButton);
