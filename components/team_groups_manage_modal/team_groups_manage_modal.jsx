// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';

import {Groups} from 'mattermost-redux/constants';

import ConfirmModal from 'components/confirm_modal';

import AddGroupsToTeamModal from 'components/add_groups_to_team_modal';

import {ModalIdentifiers} from 'utils/constants';
import {intlShape} from 'utils/react_intl';

import ListModal, {DEFAULT_NUM_PER_PAGE} from 'components/list_modal.jsx';

import DropdownIcon from 'components/widgets/icons/fa_dropdown_icon';

import groupsAvatar from 'images/groups-avatar.png';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';

import * as Utils from 'utils/utils.jsx';

class TeamGroupsManageModal extends React.PureComponent {
    static propTypes = {
        intl: intlShape.isRequired,
        team: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            getGroupsAssociatedToTeam: PropTypes.func.isRequired,
            unlinkGroupSyncable: PropTypes.func.isRequired,
            patchGroupSyncable: PropTypes.func.isRequired,
            getMyTeamMembers: PropTypes.func.isRequired,
            closeModal: PropTypes.func.isRequired,
            openModal: PropTypes.func.isRequired,
        }).isRequired,
    };

    state = {
        showConfirmModal: false,
        item: {member_count: 0},
        listModal: null,
    };

    loadItems = async (pageNumber, searchTerm) => {
        const {data} = await this.props.actions.getGroupsAssociatedToTeam(this.props.team.id, searchTerm, pageNumber, DEFAULT_NUM_PER_PAGE, true);

        return {
            items: data.groups,
            totalCount: data.totalGroupCount,
        };
    };

    handleDeleteCanceled = () => {
        this.setState({showConfirmModal: false});
    };

    handleDeleteConfirmed = () => {
        this.setState({showConfirmModal: false});
        const {item, listModal} = this.state;
        this.props.actions.unlinkGroupSyncable(item.id, this.props.team.id, Groups.SYNCABLE_TYPE_TEAM).then(async () => {
            listModal.setState({loading: true});
            const {items, totalCount} = await listModal.props.loadItems(listModal.setState.page, listModal.state.searchTerm);

            listModal.setState({loading: false, items, totalCount});
        });
    };

    onClickRemoveGroup = (item, listModal) => {
        this.setState({showConfirmModal: true, item, listModal});
    };

    onClickConfirmRemoveGroup = (item, listModal) => this.props.actions.unlinkGroupSyncable(item.id, this.props.team.id, Groups.SYNCABLE_TYPE_TEAM).then(async () => {
        listModal.setState({loading: true});
        const {items, totalCount} = await listModal.props.loadItems(listModal.setState.page, listModal.state.searchTerm);
        listModal.setState({loading: false, items, totalCount});
    });

    onHide = () => {
        this.props.actions.closeModal(ModalIdentifiers.MANAGE_TEAM_GROUPS);
    };

    titleButtonOnClick = () => {
        this.onHide();
        this.props.actions.openModal({modalId: ModalIdentifiers.ADD_GROUPS_TO_TEAM, dialogType: AddGroupsToTeamModal});
    };

    setTeamMemberStatus = async (item, listModal, isTeamAdmin) => {
        this.props.actions.patchGroupSyncable(item.id, this.props.team.id, Groups.SYNCABLE_TYPE_TEAM, {scheme_admin: isTeamAdmin}).then(async () => {
            listModal.setState({loading: true});
            const {items, totalCount} = await listModal.props.loadItems(listModal.setState.page, listModal.state.searchTerm);

            this.props.actions.getMyTeamMembers();

            listModal.setState({loading: false, items, totalCount});
        });
    };

    renderRow = (item, listModal) => {
        let title;
        if (item.scheme_admin) {
            title = Utils.localizeMessage('team_members_dropdown.teamAdmins', 'Team Admins');
        } else {
            title = Utils.localizeMessage('team_members_dropdown.teamMembers', 'Team Members');
        }

        return (
            <div
                key={item.id}
                className='more-modal__row'
            >
                <img
                    className='more-modal__image'
                    src={groupsAvatar}
                    alt='group picture'
                    width='32'
                    height='32'
                />
                <div className='more-modal__details'>
                    <div className='more-modal__name'>{item.display_name} {'-'} &nbsp;
                        <span className='more-modal__name_count'>
                            <FormattedMessage
                                id='numMembers'
                                defaultMessage='{num, number} {num, plural, one {member} other {members}}'
                                values={{
                                    num: item.member_count,
                                }}
                            />
                        </span>
                    </div>
                </div>
                <div className='more-modal__actions'>
                    <MenuWrapper>
                        <button
                            id={`teamGroupsDropdown_${item.display_name}`}
                            className='dropdown-toggle theme color--link style--none'
                            type='button'
                            aria-expanded='true'
                        >
                            <span>{title} </span>
                            <DropdownIcon/>
                        </button>
                        <Menu
                            openLeft={true}
                            ariaLabel={Utils.localizeMessage('team_members_dropdown.menuAriaLabel', 'Team member role change')}
                        >
                            <Menu.ItemAction
                                show={!item.scheme_admin}
                                onClick={() => this.setTeamMemberStatus(item, listModal, true)}
                                text={Utils.localizeMessage('team_members_dropdown.makeTeamAdmins', 'Make Team Admins')}
                            />
                            <Menu.ItemAction
                                show={Boolean(item.scheme_admin)}
                                onClick={() => this.setTeamMemberStatus(item, listModal, false)}
                                text={Utils.localizeMessage('team_members_dropdown.makeTeamMembers', 'Make Team Members')}
                            />
                            <Menu.ItemAction
                                onClick={() => this.onClickRemoveGroup(item, listModal)}
                                text={Utils.localizeMessage('group_list_modal.removeGroupButton', 'Remove Group')}
                            />
                        </Menu>
                    </MenuWrapper>
                </div>
            </div>
        );
    };

    render() {
        const {formatMessage} = this.props.intl;
        const memberCount = this.state.item.member_count;
        return (
            <>
                <ListModal
                    show={!this.state.showConfirmModal}
                    titleText={formatMessage({id: 'groups', defaultMessage: '{team} Groups'}, {team: this.props.team.display_name})}
                    searchPlaceholderText={formatMessage({id: 'manage_team_groups_modal.search_placeholder', defaultMessage: 'Search groups'})}
                    renderRow={this.renderRow}
                    loadItems={this.loadItems}
                    onHide={this.onHide}
                    titleBarButtonText={formatMessage({id: 'group_list_modal.addGroupButton', defaultMessage: 'Add Groups'})}
                    titleBarButtonOnClick={this.titleButtonOnClick}
                />
                <ConfirmModal
                    show={this.state.showConfirmModal}
                    title={formatMessage({id: 'remove_group_confirm_title', defaultMessage: 'Remove Group and {memberCount, number} {memberCount, plural, one {Member} other {Members}}'}, {memberCount})}
                    message={formatMessage({id: 'remove_group_confirm_message', defaultMessage: '{memberCount, number} {memberCount, plural, one {member} other {members}} associated to this group will be removed from the team. Are you sure you wish to remove this group and {memberCount} {memberCount, plural, one {member} other {members}}?'}, {memberCount})}
                    confirmButtonText={formatMessage({id: 'remove_group_confirm_button', defaultMessage: 'Yes, Remove Group and {memberCount, plural, one {Member} other {Members}}'}, {memberCount})}
                    onConfirm={this.handleDeleteConfirmed}
                    onCancel={this.handleDeleteCanceled}
                />
            </>
        );
    }
}

export default injectIntl(TeamGroupsManageModal);
