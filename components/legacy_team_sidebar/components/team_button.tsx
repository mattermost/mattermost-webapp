// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {injectIntl, IntlShape} from 'react-intl';
import {Link} from 'react-router-dom';
import {Draggable} from 'react-beautiful-dnd';
import classNames from 'classnames';

import {mark, trackEvent} from 'actions/telemetry_actions.jsx';
import Constants from 'utils/constants';
import {isDesktopApp} from 'utils/user_agent';
import {isMac, localizeMessage} from 'utils/utils.jsx';
import CopyUrlContextMenu from 'components/copy_url_context_menu';
import OverlayTrigger from 'components/overlay_trigger';
import TeamIcon from '../../widgets/team_icon/team_icon';

interface Props {
    btnClass?: string;
    url: string;
    displayName?: string;
    content?: string;
    tip: string | JSX.Element;
    order?: number;
    showOrder?: boolean;
    active?: boolean;
    disabled?: boolean;
    unread?: boolean;
    mentions?: number;
    placement?: 'left' | 'right' | 'top' | 'bottom';
    teamIconUrl?: string | null;
    switchTeam: (url: string) => void;
    intl: IntlShape;
    isDraggable?: boolean;
    teamIndex?: number;
    teamId?: string;
}

// eslint-disable-next-line react/require-optimization
class TeamButton extends React.PureComponent<Props> {
    handleSwitch = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        mark('TeamLink#click');
        trackEvent('ui', 'ui_team_sidebar_switch_team');
        this.props.switchTeam(this.props.url);
    }

    handleDisabled = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
    }

    render() {
        const {teamIconUrl, displayName, btnClass, mentions, unread, isDraggable = false, teamIndex, teamId} = this.props;
        const {formatMessage} = this.props.intl;

        let teamClass: string = this.props.active ? 'active' : '';
        const disabled: string = this.props.disabled ? 'team-disabled' : '';
        const isNotCreateTeamButton: boolean = !this.props.url.endsWith('create_team') && !this.props.url.endsWith('select_team');
        const handleClick = (this.props.active || this.props.disabled) ? this.handleDisabled : this.handleSwitch;

        let badge: JSX.Element | undefined;

        let ariaLabel = formatMessage({
            id: 'team.button.ariaLabel',
            defaultMessage: '{teamName} team',
        },
        {
            teamName: displayName,
        });

        if (!teamClass) {
            if (unread) {
                teamClass = 'unread';
            } else if (isNotCreateTeamButton) {
                teamClass = '';
            } else {
                teamClass = 'special';
            }
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
                name={this.props.content || displayName || ''}
                url={teamIconUrl}
            />
        );

        let toolTip = this.props.tip || localizeMessage('team.button.name_undefined', 'This team does not have a name');
        let orderIndicator: JSX.Element | undefined;
        if (typeof this.props.order !== 'undefined' && this.props.order < 10) {
            let toolTipHelp;
            if (isMac()) {
                toolTipHelp = formatMessage({
                    id: 'team.button.tooltip.mac',
                    defaultMessage: '⌘ ⌥ {order}',
                },
                {
                    order: this.props.order,
                });
            } else {
                toolTipHelp = formatMessage({
                    id: 'team.button.tooltip',
                    defaultMessage: 'Ctrl+Alt+{order}',
                },
                {
                    order: this.props.order,
                });
            }

            toolTip = (
                <>
                    {toolTip}
                    <div className='tooltip-help'>{toolTipHelp}</div>
                </>
            );

            if (this.props.showOrder) {
                orderIndicator = (
                    <div className='order-indicator'>
                        {this.props.order}
                    </div>
                );
            }
        }

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

        let teamButton = (
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

        if (isDesktopApp()) {
            // if this is not a "special" team button, give it a context menu
            if (isNotCreateTeamButton) {
                teamButton = (
                    <CopyUrlContextMenu
                        link={this.props.url}
                        menuId={this.props.url}
                    >
                        {teamButton}
                    </CopyUrlContextMenu>
                );
            }
        }

        return isDraggable ? (
            <Draggable
                draggableId={teamId!}
                index={teamIndex!}
            >
                {(provided, snapshot) => {
                    return (
                        <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={classNames([`team-container ${teamClass}`, {isDragging: snapshot.isDragging}])}
                        >
                            {teamButton}
                            {orderIndicator}
                        </div>
                    );
                }}
            </Draggable>
        ) : (
            <div className={`team-container ${teamClass}`}>
                {teamButton}
                {orderIndicator}
            </div>
        );
    }
}

export default injectIntl(TeamButton);
