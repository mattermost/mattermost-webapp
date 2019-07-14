// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, intlShape} from 'react-intl';

import {Groups} from 'mattermost-redux/constants';

import AddGroupsToChannelModal from 'components/add_groups_to_channel_modal';

import {ModalIdentifiers} from 'utils/constants.jsx';

import ListModal, {DEFAULT_NUM_PER_PAGE} from 'components/list_modal.jsx';

import groupsAvatar from 'images/groups-avatar.png';

export default class ChannelGroupsManageModal extends React.PureComponent {
    static propTypes = {
        channel: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            getGroupsAssociatedToChannel: PropTypes.func.isRequired,
            unlinkGroupSyncable: PropTypes.func.isRequired,
            closeModal: PropTypes.func.isRequired,
            openModal: PropTypes.func.isRequired,
        }).isRequired,
    };

    static contextTypes = {
        intl: intlShape,
    };

    loadItems = async (pageNumber, searchTerm) => {
        const {data} = await this.props.actions.getGroupsAssociatedToChannel(this.props.channel.id, searchTerm, pageNumber, DEFAULT_NUM_PER_PAGE);
        return {
            items: data.groups,
            totalCount: data.totalGroupCount,
        };
    };

    onClickRemoveGroup = (item, listModal) => this.props.actions.unlinkGroupSyncable(item.id, this.props.channel.id, Groups.SYNCABLE_TYPE_CHANNEL).then(async () => {
        listModal.setState({loading: true});
        const {items} = await listModal.props.loadItems(listModal.setState.page, listModal.state.searchTerm);
        listModal.setState({loading: false, items});
    });

    onHide = () => {
        this.props.actions.closeModal(ModalIdentifiers.MANAGE_CHANNEL_GROUPS);
    };

    titleButtonOnClick = () => {
        this.onHide();
        this.props.actions.openModal({modalId: ModalIdentifiers.ADD_GROUPS_TO_TEAM, dialogType: AddGroupsToChannelModal});
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
        return (
            <ListModal
                titleText={formatMessage({id: 'groups', defaultMessage: '{channel} Groups'}, {channel: this.props.channel.display_name})}
                searchPlaceholderText={formatMessage({id: 'manage_channel_groups_modal.search_placeholder', defaultMessage: 'Search groups'})}
                renderRow={this.renderRow}
                loadItems={this.loadItems}
                onHide={this.onHide}
                titleBarButtonText={formatMessage({id: 'group_list_modal.addGroupButton', defaultMessage: 'Add Groups'})}
                titleBarButtonOnClick={this.titleButtonOnClick}
            />
        );
    }
}
