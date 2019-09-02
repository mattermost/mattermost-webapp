// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import ConfirmModal from 'components/confirm_modal.jsx';

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

    toggleCollapse = () => {
        this.props.onToggleCollapse(this.props.id);
    }

    render = () => {
        let extraClasses = '';
        let arrowIcon = null;
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
        switch (this.props.type) {
        case 'public-team':
            teamIcon = (
                <div className='team-icon team-icon-public'>
                    <i className={'fa fa-circle-o-notch'}/>
                </div>
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
            break;
        case 'private-channel':
            channelIcon = (
                <div className='channel-icon'>
                    <LockIcon className='icon icon__lock'/>
                </div>
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
