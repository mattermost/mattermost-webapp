// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, intlShape} from 'react-intl';

import {Groups} from 'mattermost-redux/constants';

import ConfirmModal from 'components/confirm_modal.jsx';

import AddGroupsToTeamModal from 'components/add_groups_to_team_modal';

import {ModalIdentifiers} from 'utils/constants.jsx';

import ListModal, {DEFAULT_NUM_PER_PAGE} from 'components/list_modal.jsx';

import groupsAvatar from 'images/groups-avatar.png';

export default class TeamGroupsManageModal extends React.PureComponent {
    static propTypes = {
        team: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            getGroupsAssociatedToTeam: PropTypes.func.isRequired,
            unlinkGroupSyncable: PropTypes.func.isRequired,
            closeModal: PropTypes.func.isRequired,
            openModal: PropTypes.func.isRequired,
        }).isRequired,
    };

    static contextTypes = {
        intl: intlShape,
    };

    state = {
        showConfirmModal: false,
        item: {member_count: 0},
        listModal: null,
    };

    loadItems = async (pageNumber, searchTerm) => {
        const {data} = await this.props.actions.getGroupsAssociatedToTeam(this.props.team.id, searchTerm, pageNumber, DEFAULT_NUM_PER_PAGE);
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
            const {items} = await listModal.props.loadItems(listModal.setState.page, listModal.state.searchTerm);
            listModal.setState({loading: false, items});
        });
    };

    onClickRemoveGroup = (item, listModal) => {
        this.setState({showConfirmModal: true, item, listModal});
    };

    onClickConfirmRemoveGroup = (item, listModal) => this.props.actions.unlinkGroupSyncable(item.id, this.props.team.id, Groups.SYNCABLE_TYPE_TEAM).then(async () => {
        listModal.setState({loading: true});
        const {items} = await listModal.props.loadItems(listModal.setState.page, listModal.state.searchTerm);
        listModal.setState({loading: false, items});
    });

    onHide = () => {
        this.props.actions.closeModal(ModalIdentifiers.MANAGE_TEAM_GROUPS);
    };

    titleButtonOnClick = () => {
        this.onHide();
        this.props.actions.openModal({modalId: ModalIdentifiers.ADD_GROUPS_TO_TEAM, dialogType: AddGroupsToTeamModal});
    };

    renderRow = (item, listModal) => {
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
                    <div className='more-modal__name'>{item.display_name} {'-'} <span>
                        <FormattedMessage
                            id='numMembers'
                            defaultMessage='{num, number} {num, plural, one {member} other {members}}'
                            values={{
                                num: item.member_count,
                            }}
                        /></span>
                    </div>
                </div>
                <div className='more-modal__actions'>
                    <button
                        id='removeMember'
                        type='button'
                        className='btn btn-danger btn-message'
                        onClick={() => this.onClickRemoveGroup(item, listModal)}
                    >
                        <FormattedMessage
                            id='group_list_modal.removeGroupButton'
                            defaultMessage='Remove Group'
                        />
                    </button>
                </div>
            </div>
        );
    };

    render() {
        const {formatMessage} = this.context.intl;
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
                    message={formatMessage({id: 'remove_group_confirm_message', defaultMessage: '{memberCount, number} {memberCount, plural, one {member} other {members}} associated to this group will be removed from the team on the next scheduled AD/LDAP synchronization. Are you sure you wish to remove this group and {memberCount} {memberCount, plural, one {member} other {members}}?'}, {memberCount})}
                    confirmButtonText={formatMessage({id: 'remove_group_confirm_button', defaultMessage: 'Yes, Remove Group and {memberCount, plural, one {Member} other {Members}}'}, {memberCount})}
                    onConfirm={this.handleDeleteConfirmed}
                    onCancel={this.handleDeleteCanceled}
                />
            </>
        );
    }
}
