// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Groups} from 'mattermost-redux/constants';

import AddGroupsToChannelModal from 'components/add_groups_to_channel_modal';

import {ModalIdentifiers} from 'utils/constants';
import {intlShape} from 'utils/react_intl';

import ListModal, {DEFAULT_NUM_PER_PAGE} from 'components/list_modal.jsx';

import groupsAvatar from 'images/groups-avatar.png';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';

import * as Utils from 'utils/utils.jsx';

export default class ChannelGroupsManageModal extends React.PureComponent {
    static propTypes = {
        channel: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            getGroupsAssociatedToChannel: PropTypes.func.isRequired,
            unlinkGroupSyncable: PropTypes.func.isRequired,
            patchGroupSyncable: PropTypes.func.isRequired,
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
        const {items, totalCount} = await listModal.props.loadItems(listModal.setState.page, listModal.state.searchTerm);
        listModal.setState({loading: false, items, totalCount});
    });

    onHide = () => {
        this.props.actions.closeModal(ModalIdentifiers.MANAGE_CHANNEL_GROUPS);
    };

    titleButtonOnClick = () => {
        this.onHide();
        this.props.actions.openModal({modalId: ModalIdentifiers.ADD_GROUPS_TO_TEAM, dialogType: AddGroupsToChannelModal});
    };

    makeChannelAdmin = async (item, listModal) => {
        this.props.actions.patchGroupSyncable(item.id, this.props.channel.id, Groups.SYNCABLE_TYPE_CHANNEL, {scheme_admin: true}).then(async () => {
            listModal.setState({loading: true});
            const {items, totalCount} = await listModal.props.loadItems(listModal.setState.page, listModal.state.searchTerm);
            listModal.setState({loading: false, items, totalCount});
        });
    };

    makeChannelMember = async (item, listModal) => {
        this.props.actions.patchGroupSyncable(item.id, this.props.channel.id, Groups.SYNCABLE_TYPE_CHANNEL, {scheme_admin: false}).then(async () => {
            listModal.setState({loading: true});
            const {items, totalCount} = await listModal.props.loadItems(listModal.setState.page, listModal.state.searchTerm);
            listModal.setState({loading: false, items, totalCount});
        });
    };

    renderRow = (item, listModal) => {
        let title;
        if (item.scheme_admin) {
            title = Utils.localizeMessage('channel_members_dropdown.channel_admin', 'Channel Admin');
        } else {
            title = Utils.localizeMessage('channel_members_dropdown.channel_member', 'Channel Member');
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
                <div className='more-modal__dropdown'>
                    <MenuWrapper>
                        <a>
                            <span>{title} </span>
                            <span className='caret'/>
                        </a>
                        <Menu
                            openLeft={true}
                            ariaLabel={Utils.localizeMessage('channel_members_dropdown.menuAriaLabel', 'Channel member role change')}
                        >
                            <Menu.ItemAction
                                show={!item.scheme_admin}
                                onClick={() => this.makeChanneldmin(item, listModal)}
                                text={Utils.localizeMessage('admin.user_item.channel_members_dropdown.make_channel_admin', 'Make Channel Admin')}
                            />
                            <Menu.ItemAction
                                show={Boolean(item.scheme_admin)}
                                onClick={() => this.makeChannelMember(item, listModal)}
                                text={Utils.localizeMessage('channel_members_dropdown.make_channel_member', 'Make Channel Member')}
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
