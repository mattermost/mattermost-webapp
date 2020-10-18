// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Constants} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import DropdownIcon from 'components/widgets/icons/fa_dropdown_icon';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

const ROWS_FROM_BOTTOM_TO_OPEN_UP = 3;

export default class ChannelMembersDropdown extends React.PureComponent {
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
            getChannelMember: PropTypes.func.isRequired,
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
            this.props.actions.getChannelMember(this.props.channel.id, this.props.user.id);
        }
    };

    handleMakeChannelAdmin = async () => {
        const {error} = await this.props.actions.updateChannelMemberSchemeRoles(this.props.channel.id, this.props.user.id, true, true);
        if (error) {
            this.setState({serverError: error.message});
        } else {
            this.props.actions.getChannelStats(this.props.channel.id);
            this.props.actions.getChannelMember(this.props.channel.id, this.props.user.id);
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
        const {index, totalUsers, isLicensed, channelMember, user, channel, currentUserId, canChangeMemberRoles, canRemoveMember} = this.props;
        const {serverError} = this.state;

        const isChannelAdmin = Utils.isChannelAdmin(isLicensed, channelMember.roles, channelMember.scheme_admin);
        const isGuest = Utils.isGuest(user);
        const isMember = !isChannelAdmin && !isGuest;
        const isDefaultChannel = channel.name === Constants.DEFAULT_CHANNEL;
        const currentRole = this.renderRole(isChannelAdmin, isGuest);

        if (user.id === currentUserId) {
            return null;
        }
        const canMakeUserChannelMember = canChangeMemberRoles && isChannelAdmin;
        const canMakeUserChannelAdmin = canChangeMemberRoles && isLicensed && isMember;
        const canRemoveUserFromChannel = canRemoveMember && (!channel.group_constrained || user.is_bot) && (!isDefaultChannel || isGuest);

        if (canMakeUserChannelMember || canMakeUserChannelAdmin || canRemoveUserFromChannel) {
            return (
                <MenuWrapper>
                    <button
                        className='dropdown-toggle theme color--link style--none'
                        type='button'
                    >
                        <span className='sr-only'>{user.username}</span>
                        <span>{currentRole} </span>
                        <DropdownIcon/>
                    </button>
                    <Menu
                        openLeft={true}
                        openUp={totalUsers > ROWS_FROM_BOTTOM_TO_OPEN_UP && totalUsers - index <= ROWS_FROM_BOTTOM_TO_OPEN_UP}
                        ariaLabel={Utils.localizeMessage('channel_members_dropdown.menuAriaLabel', 'Change the role of channel member')}
                    >
                        <Menu.ItemAction
                            id={`${user.username}-make-channel-member`}
                            show={canMakeUserChannelMember}
                            onClick={this.handleMakeChannelMember}
                            text={Utils.localizeMessage('channel_members_dropdown.make_channel_member', 'Make Channel Member')}
                        />
                        <Menu.ItemAction
                            id={`${user.username}-make-channel-admin`}
                            show={canMakeUserChannelAdmin}
                            onClick={this.handleMakeChannelAdmin}
                            text={Utils.localizeMessage('channel_members_dropdown.make_channel_admin', 'Make Channel Admin')}
                        />
                        <Menu.ItemAction
                            show={canRemoveUserFromChannel}
                            onClick={this.handleRemoveFromChannel}
                            text={Utils.localizeMessage('channel_members_dropdown.remove_from_channel', 'Remove from Channel')}
                        />
                        {serverError && (
                            <div className='has-error'>
                                <label className='has-error control-label'>{serverError}</label>
                            </div>
                        )}
                    </Menu>
                </MenuWrapper>
            );
        }

        if (isDefaultChannel) {
            return (
                <div/>
            );
        }

        return (
            <div>
                {currentRole}
            </div>
        );
    }
}
