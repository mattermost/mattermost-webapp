// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {Link} from 'react-router-dom';

import {mark, trackEvent} from 'actions/diagnostics_actions.jsx';
import {switchTeams} from 'actions/team_actions.jsx';
import Constants from 'utils/constants.jsx';
import {isDesktopApp} from 'utils/user_agent.jsx';
import {localizeMessage} from 'utils/utils.jsx';
import CopyUrlContextMenu from 'components/copy_url_context_menu';

export default class TeamButton extends React.Component {
    constructor(props) {
        super(props);

        this.handleSwitch = this.handleSwitch.bind(this);
        this.handleDisabled = this.handleDisabled.bind(this);
    }

    handleSwitch(e) {
        e.preventDefault();
        mark('TeamLink#click');
        trackEvent('ui', 'ui_team_sidebar_switch_team');
        switchTeams(this.props.url);
    }

    handleDisabled(e) {
        e.preventDefault();
    }

    render() {
        const teamIconUrl = this.props.teamIconUrl;

        let teamClass = this.props.active ? 'active' : '';
        const btnClass = this.props.btnClass;
        const disabled = this.props.disabled ? 'team-disabled' : '';
        const handleClick = (this.props.active || this.props.disabled) ? this.handleDisabled : this.handleSwitch;
        let badge;

        if (!teamClass) {
            teamClass = this.props.unread ? 'unread' : '';

            if (this.props.mentions) {
                badge = (
                    <span className={'badge pull-right small'}>{this.props.mentions}</span>
                );
            }
        }

        let btn;
        let content = this.props.content;

        if (!content) {
            if (teamIconUrl) {
                content = (
                    <div className='team-btn__content'>
                        <div
                            className='team-btn__image'
                            style={{backgroundImage: `url('${teamIconUrl}')`}}
                        />
                    </div>
                );
            } else {
                let initials = this.props.displayName;
                initials = initials ? initials.replace(/\s/g, '').substring(0, 2) : '??';

                content = (
                    <div className='team-btn__content'>
                        <div className='team-btn__initials'>
                            {initials}
                        </div>
                    </div>
                );
            }
        }

        if (this.props.isMobile) {
            btn = (
                <div className={'team-btn ' + btnClass}>
                    {badge}
                    {content}
                </div>
            );
        } else {
            const toolTip = this.props.tip || localizeMessage('team.button.name_undefined', 'Name undefined');
            btn = (
                <OverlayTrigger
                    trigger={['hover', 'focus']}
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
        }

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

TeamButton.defaultProps = {
    btnClass: '',
    tip: '',
    placement: 'right',
    active: false,
    disabled: false,
    unread: false,
    mentions: 0,
};

TeamButton.propTypes = {
    btnClass: PropTypes.string,
    url: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    content: PropTypes.node,
    tip: PropTypes.node.isRequired,
    active: PropTypes.bool,
    disabled: PropTypes.bool,
    isMobile: PropTypes.bool,
    unread: PropTypes.bool,
    mentions: PropTypes.number,
    placement: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    teamIconUrl: PropTypes.string,
};
