// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Modal} from 'react-bootstrap';

import GlobeIcon from 'components/svg/globe_icon';
import LockIcon from 'components/svg/lock_icon';

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

        return (
            <div className={'group-teams-and-channels-row' + extraClasses}>
                <Modal
                    dialogClassName='admin-modal'
                    show={this.state.showConfirmationModal}
                    onHide={() => this.setState({showConfirmationModal: false})}
                >
                    <Modal.Header
                        closeButton={true}
                    >
                        <h4 className='modal-title'>
                            <FormattedMessage
                                id='admin.group_settings.group_details.group_teams_and_channels_row.remove.confirm_header'
                                defaultMessage='Lorem ipsum dolor sit amet?'
                            />
                        </h4>
                    </Modal.Header>
                    <Modal.Body>
                        <FormattedMessage
                            id='admin.group_settings.group_details.group_teams_and_channels_row.remove.confirm_body'
                            defaultMessage='Mauris aliquam, ipsum at vestibulum hendrerit, nisi nisl posuere libero, a cursus magna nulla vitae nibh. Vivamus venenatis velit sed mauris pharetra iaculis.'
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            type='button'
                            className='btn btn-cancel'
                            onClick={() => this.setState({showConfirmationModal: false})}
                        >
                            <FormattedMessage
                                id='confirm_modal.cancel'
                                defaultMessage='Cancel'
                            />
                        </button>
                        <button
                            id='linkModalCloseButton'
                            type='button'
                            className='btn btn-default'
                            onClick={() => {
                                this.removeItem();
                            }}
                        >
                            <FormattedMessage
                                id='admin.group_settings.group_details.group_teams_and_channels_row.remove.confirm_button'
                                defaultMessage='Yes, Remove'
                            />
                        </button>
                    </Modal.Footer>
                </Modal>
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
