// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {isNil} from 'lodash';

import ConfirmModal from 'components/confirm_modal.jsx';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {localizeMessage} from 'utils/utils.jsx';
import GlobeIcon from 'components/widgets/icons/globe_icon';
import LockIcon from 'components/widgets/icons/lock_icon';

export default class GroupTeamsAndChannelsRow extends React.PureComponent {
    static propTypes = {
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        implicit: PropTypes.bool,
        hasChildren: PropTypes.bool,
        collapsed: PropTypes.bool,
        onRemoveItem: PropTypes.func.isRequired,
        onToggleCollapse: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            showConfirmationModal: false,
        };
    }

    removeItem = () => {
        this.props.onRemoveItem(this.props.id, this.props.type);
        this.setState({showConfirmationModal: false});
    }

    changeRoles = () => {
        this.props.onChangeRoles(this.props.id, this.props.type, !this.props.scheme_admin);
    }

    toggleCollapse = () => {
        this.props.onToggleCollapse(this.props.id);
    }

    displayAssignedRolesDropdown = () => {
        const { scheme_admin } = this.props;
        const channelAdmin = (
            <FormattedMessage
                id='admin.group_teams_and_channels_row.channelAdmin'
                defaultMessage='Channel Admin'
            />
        );
        const teamAdmin = (
            <FormattedMessage
                id='admin.group_teams_and_channels_row.teamAdmin'
                defaultMessage='Channel Admin'
            />
        );
        const member = (
            <FormattedMessage
                id='admin.group_teams_and_channels_row.member'
                defaultMessage='Member'
            />
        );
        let dropDown = null;
        if (!isNil(scheme_admin)) {
            let currentRole = member;
            let roleToBe = (this.props.type.includes('team')) ? teamAdmin : channelAdmin;
            if (scheme_admin) {
                currentRole = (this.props.type.includes('team')) ? teamAdmin : channelAdmin;
                roleToBe = member;
            }
            dropDown = (
                <div >
                <MenuWrapper>
                    <div>
                        <a>
                            <span>{currentRole} </span>
                            <span className='caret'/>
                        </a>
                    </div>
                    <Menu
                        openLeft={true}
                        openUp={true}
                        ariaLabel={localizeMessage('admin.team_channel_settings.group_row.memberRole', 'Member Role')}
                    >
                        <Menu.ItemAction
                            show
                            onClick={this.changeRoles}
                            text={roleToBe}
                        />
                    </Menu>
                </MenuWrapper>
            </div>
            );
        }


        return dropDown;
    }

    render = () => {
        let extraClasses = '';
        let arrowIcon = null;
        console.log(this.props)
        if (this.props.hasChildren) {
            arrowIcon = (
                <i
                    className={'fa fa-caret-right' + (this.props.collapsed ? '' : ' open')}
                    onClick={this.toggleCollapse}
                />
            );
            extraClasses += ' has-clidren';
        }

        if (this.props.collapsed) {
            extraClasses += ' collapsed';
        }

        let teamIcon = null;
        let channelIcon = null;
        let typeText = null;
        switch (this.props) {
        case 'public-team':
            teamIcon = (
                <div className='team-icon team-icon-public'>
                    <i className={'fa fa-circle-o-notch'}/>
                </div>
            );
            typeText = (
                <FormattedMessage
                    id='admin.group_settings.group_details.group_teams_and_channels_row.publicTeam'
                    defaultMessage='Team'
                />
            );
            break;
        case 'private-team':
            teamIcon = (
                <div className='team-icon team-icon-private'>
                    <span className='fa-stack fa-2x'>
                        <i className={'fa fa-circle-thin fa-stack-2x'}/>
                        <i className={'fa fa-lock fa-stack-1x'}/>
                    </span>
                </div>
            );
            typeText = (
                <FormattedMessage
                    id='admin.group_settings.group_details.group_teams_and_channels_row.privateTeam'
                    defaultMessage='Team (Private)'
                />
            );
            break;
        default:
            teamIcon = (<div className='team-icon'/>);
        }

        switch (this.props.type) {
        case 'public-channel':
            channelIcon = (
                <div className='channel-icon'>
                    <GlobeIcon className='icon icon__globe'/>
                </div>
            );
            typeText = (
                <FormattedMessage
                    id='admin.group_settings.group_details.group_teams_and_channels_row.publicChannel'
                    defaultMessage='Channel'
                />
            );
            break;
        case 'private-channel':
            channelIcon = (
                <div className='channel-icon'>
                    <LockIcon className='icon icon__lock'/>
                </div>
            );
            typeText = (
                <FormattedMessage
                    id='admin.group_settings.group_details.group_teams_and_channels_row.privateChannel'
                    defaultMessage='Channel (Private)'
                />
            );
            break;
        }

        const displayType = this.props.type.split('-')[1];

        return (
            <div className={'group-teams-and-channels-row' + extraClasses}>
                <ConfirmModal
                    show={this.state.showConfirmationModal}
                    title={
                        <FormattedMessage
                            id='admin.group_settings.group_details.group_teams_and_channels_row.remove.confirm_header'
                            defaultMessage={`Remove Membership from the '${this.props.name}' ${displayType}?`}
                            values={{name: this.props.name, displayType}}
                        />
                    }
                    message={
                        <FormattedMessage
                            id='admin.group_settings.group_details.group_teams_and_channels_row.remove.confirm_body'
                            defaultMessage={`Removing this membership will prevent future users in this group from being added to the '${this.props.name}' ${displayType}.`}
                            values={{name: this.props.name, displayType}}
                        />
                    }
                    confirmButtonText={
                        <FormattedMessage
                            id='admin.group_settings.group_details.group_teams_and_channels_row.remove.confirm_button'
                            defaultMessage='Yes, Remove'
                        />
                    }
                    onConfirm={this.removeItem}
                    onCancel={() => this.setState({showConfirmationModal: false})}
                />

                <div className='arrow-icon'>
                    {arrowIcon}
                </div>
                {teamIcon}
                {channelIcon}
                <div className='name'>
                    {this.props.name}
                </div>
                {typeText}
                {this.displayAssignedRolesDropdown()}
                <div className='remove'>
                    {!this.props.implicit &&
                        <button
                            className='btn btn-link'
                            onClick={() => this.setState({showConfirmationModal: true})}
                        >
                            <FormattedMessage
                                id='admin.group_settings.group_details.group_teams_and_channels_row.remove'
                                defaultMessage='Remove'
                            />
                        </button>
                    }
                </div>
            </div>
        );
    };
}
