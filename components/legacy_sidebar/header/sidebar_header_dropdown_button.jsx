// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Tooltip} from 'react-bootstrap';

import {localizeMessage} from 'utils/utils.jsx';
import OverlayTrigger from 'components/overlay_trigger';
import MenuIcon from 'components/widgets/icons/menu_icon';
import Constants from 'utils/constants';

import MenuTutorialTip from 'components/tutorial/menu_tutorial_tip';
import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

export default class SidebarHeaderDropdownButton extends React.PureComponent {
    static propTypes = {
        showTutorialTip: PropTypes.bool.isRequired,
        teamDescription: PropTypes.string.isRequired,
        teamId: PropTypes.string.isRequired,
        currentUser: PropTypes.object.isRequired,
        teamDisplayName: PropTypes.string.isRequired,
    };

    render() {
        let tutorialTip = null;
        if (this.props.showTutorialTip) {
            tutorialTip = (
                <MenuTutorialTip onBottom={false}/>
            );
        }

        let teamNameWithToolTip = (
            <h1
                id='headerTeamName'
                className='team__name'
                data-teamid={this.props.teamId}
            >
                {this.props.teamDisplayName}
            </h1>
        );
        if (this.props.teamDescription) {
            teamNameWithToolTip = (
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={<Tooltip id='team-name__tooltip'>{this.props.teamDescription}</Tooltip>}
                >
                    {teamNameWithToolTip}
                </OverlayTrigger>
            );
        }

        let status = null;
        const currentUser = this.props.currentUser;
        if (currentUser && currentUser.props && currentUser.props.customStatus) {
            const customStatus = JSON.parse(currentUser.props.customStatus);
            const imgURI = getEmojiImageUrl(this.props.emojiMap.get(customStatus.emoji));
            const statusEmoji = (
                <span data-emoticon={customStatus.emoji} className="custom-status-emoji">
                    <span
                        alt={customStatus.emoji}
                        className='emoticon'
                        style={{backgroundImage: 'url(' + imgURI + ')'}}
                    >
                        {customStatus.emoji}
                    </span>
                </span>
            );
            status = (
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={
                        <Tooltip id='custom-status'>
                            <div className='custom-status'>
                                {statusEmoji}
                                <span className='custom-status-text'>
                                    {customStatus.text}
                                </span>
                            </div>
                        </Tooltip>
                    }
                >
                    {statusEmoji}
                </OverlayTrigger>
            );
        }

        return (
            <div
                className='SidebarHeaderDropdownButton'
                id='sidebarHeaderDropdownButton'
            >
                {tutorialTip}
                <div
                    id='headerInfo'
                    className='header__info'
                >
                    {teamNameWithToolTip}
                    <div
                        id='headerInfoContent'
                        className='header__info__content'
                    >
                        <div
                            id='headerUsername'
                            className='user__name'
                        >
                            {'@' + this.props.currentUser.username}
                        </div>
                        {status}
                    </div>
                    <button
                        className='style--none sidebar-header-dropdown__icon'
                        aria-label={localizeMessage('navbar_dropdown.menuAriaLabel', 'main menu')}
                    >
                        <MenuIcon/>
                    </button>
                </div>
            </div>
        );
    }
}
