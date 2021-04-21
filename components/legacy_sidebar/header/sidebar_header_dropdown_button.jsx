// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Tooltip} from 'react-bootstrap';

import {isAdmin, localizeMessage} from 'utils/utils.jsx';
import OverlayTrigger from 'components/overlay_trigger';
import MenuIcon from 'components/widgets/icons/menu_icon';
import Constants, {ModalIdentifiers} from 'utils/constants';

import MenuTutorialTip from 'components/tutorial/menu_tutorial_tip';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import CustomStatusModal from 'components/custom_status/custom_status_modal';

export default class SidebarHeaderDropdownButton extends React.PureComponent {
    static propTypes = {
        showTutorialTip: PropTypes.bool.isRequired,
        teamDescription: PropTypes.string.isRequired,
        teamId: PropTypes.string.isRequired,
        currentUser: PropTypes.object.isRequired,
        teamDisplayName: PropTypes.string.isRequired,
        openModal: PropTypes.func,
        getFirstAdminVisitMarketplaceStatus: PropTypes.func,
        showUnread: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        this.state = {
            showUnread: false,
        };
    }

    handleCustomStatusEmojiClick = (event) => {
        event.stopPropagation();
        const customStatusInputModalData = {
            ModalId: ModalIdentifiers.CUSTOM_STATUS,
            dialogType: CustomStatusModal,
        };
        this.props.openModal(customStatusInputModalData);
    }

    getFirstAdminVisitMarketplaceStatus = async () => {
        const {data} = await this.props.getFirstAdminVisitMarketplaceStatus();
        this.setState({showUnread: !data});
    }

    componentDidMount() {
        const isSystemAdmin = isAdmin(this.props.currentUser.roles);
        if (isSystemAdmin) {
            this.getFirstAdminVisitMarketplaceStatus();
        }
    }

    componentDidUpdate() {
        const isSystemAdmin = isAdmin(this.props.currentUser.roles);
        const {showUnread} = this.props;
        if (isSystemAdmin && showUnread !== this.state.showUnread) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({showUnread: this.props.showUnread});
        }
    }

    render() {
        let tutorialTip = null;
        let badge = null;

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

        if (this.state.showUnread) {
            badge = (
                <span className={'style--none unread-badge-addon'}>
                    <span className={'unread-badge'}/>
                </span>

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
                        <CustomStatusEmoji
                            showTooltip={true}
                            tooltipDirection='bottom'
                            emojiStyle={{
                                verticalAlign: 'top',
                                marginLeft: 2,
                            }}
                            onClick={this.handleCustomStatusEmojiClick}
                        />
                    </div>
                    <button
                        className='style--none sidebar-header-dropdown__icon'
                        aria-label={localizeMessage('navbar_dropdown.menuAriaLabel', 'main menu')}
                    >
                        {badge}
                        <MenuIcon/>
                    </button>
                </div>
            </div>
        );
    }
}
