// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Constants} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import DropdownIcon from 'components/widgets/icons/fa_dropdown_icon';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

const ROWS_FROM_BOTTOM_TO_OPEN_UP = 3;

export default class ChannelMembersDropdown extends React.Component {
    static propTypes = {
        channel: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired,
        currentUserId: PropTypes.string.isRequired,
        channelMember: PropTypes.object.isRequired,
        isLicensed: PropTypes.bool.isRequired,
        canChangeMemberRoles: PropTypes.bool.isRequired,
        canRemoveMember: PropTypes.bool.isRequired,
        index: PropTypes.number.isRequired,
        totalUsers: PropTypes.number.isRequired,
        actions: PropTypes.shape({
            getChannelStats: PropTypes.func.isRequired,
            updateChannelMemberSchemeRoles: PropTypes.func.isRequired,
            removeChannelMember: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            serverError: null,
            removing: false,
        };
    }

    handleRemoveFromChannel = () => {
        if (this.state.removing) {
            return;
        }

        const {actions, channel, user} = this.props;
        this.setState({removing: true});

        actions.removeChannelMember(channel.id, user.id).then((result) => {
            if (result.error) {
                this.setState({
                    serverError: result.error.message,
                    removing: false,
                });
                return;
            }

            this.setState({removing: false});
            actions.getChannelStats(channel.id);
        });
    };

    handleMakeChannelMember = async () => {
        const {error} = await this.props.actions.updateChannelMemberSchemeRoles(this.props.channel.id, this.props.user.id, true, false);
        if (error) {
            this.setState({serverError: error.message});
        } else {
            this.props.actions.getChannelStats(this.props.channel.id);
        }
    };

    handleMakeChannelAdmin = async () => {
        const {error} = await this.props.actions.updateChannelMemberSchemeRoles(this.props.channel.id, this.props.user.id, true, true);
        if (error) {
            this.setState({serverError: error.message});
        } else {
            this.props.actions.getChannelStats(this.props.channel.id);
        }
    };

    renderRole(isChannelAdmin, isGuest) {
        if (isChannelAdmin) {
            return (
                <FormattedMessage
                    id='channel_members_dropdown.channel_admin'
                    defaultMessage='Channel Admin'
                />
            );
        } else if (isGuest) {
            return (
                <FormattedMessage
                    id='channel_members_dropdown.channel_guest'
                    defaultMessage='Channel Guest'
                />
            );
        }
        return (
            <FormattedMessage
                id='channel_members_dropdown.channel_member'
                defaultMessage='Channel Member'
            />
        );
    }

    render() {
        const supportsChannelAdmin = this.props.isLicensed;
        const isChannelAdmin = supportsChannelAdmin && (Utils.isChannelAdmin(this.props.isLicensed, this.props.channelMember.roles) || this.props.channelMember.scheme_admin);
        const isGuest = Utils.isGuest(this.props.user);

        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className='has-error'>
                    <label className='has-error control-label'>{this.state.serverError}</label>
                </div>
            );
        }

        if (this.props.user.id === this.props.currentUserId) {
            return null;
        }

        if (this.props.canChangeMemberRoles) {
            const role = this.renderRole(isChannelAdmin, isGuest);

            const canRemoveFromChannel = this.props.canRemoveMember && (this.props.channel.name !== Constants.DEFAULT_CHANNEL || isGuest) && !this.props.channel.group_constrained;
            const canMakeChannelMember = isChannelAdmin && !isGuest;
            const canMakeChannelAdmin = supportsChannelAdmin && !isChannelAdmin && !isGuest;

            if ((canMakeChannelMember || canMakeChannelAdmin || canRemoveFromChannel)) {
                const {index, totalUsers} = this.props;
                let openUp = false;
                if (totalUsers > ROWS_FROM_BOTTOM_TO_OPEN_UP && totalUsers - index <= ROWS_FROM_BOTTOM_TO_OPEN_UP) {
                    openUp = true;
                }

                return (
                    <MenuWrapper>
                        <button
                            className='dropdown-toggle theme color--link style--none'
                            type='button'
                        >
                            <span className='sr-only'>{this.props.user.username}</span>
                            <span>{role} </span>
                            <DropdownIcon/>
                        </button>
                        <Menu
                            openLeft={true}
                            openUp={openUp}
                            ariaLabel={Utils.localizeMessage('channel_members_dropdown.menuAriaLabel', 'Channel member role change')}
                        >
                            <Menu.ItemAction
                                show={canMakeChannelMember}
                                onClick={this.handleMakeChannelMember}
                                text={Utils.localizeMessage('channel_members_dropdown.make_channel_member', 'Make Channel Member')}
                            />
                            <Menu.ItemAction
                                show={canMakeChannelAdmin}
                                onClick={this.handleMakeChannelAdmin}
                                text={Utils.localizeMessage('channel_members_dropdown.make_channel_admin', 'Make Channel Admin')}
                            />
                            <Menu.ItemAction
                                show={canRemoveFromChannel}
                                onClick={this.handleRemoveFromChannel}
                                text={Utils.localizeMessage('channel_members_dropdown.remove_from_channel', 'Remove From Channel')}
                            />
                            {serverError}
                        </Menu>
                    </MenuWrapper>
                );
            }
        }

        if (this.props.channel.name === Constants.DEFAULT_CHANNEL) {
            return (
                <div/>
            );
        }

        return (
            <div>
                {this.renderRole(isChannelAdmin)}
            </div>
        );
    }
}
