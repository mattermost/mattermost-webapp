// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {ModalData} from 'types/actions';
import LocalizedIcon from 'components/localized_icon';
import {t} from 'utils/i18n';
import {Group} from 'mattermost-redux/types/groups';
import {ModalIdentifiers} from 'utils/constants';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import AddUsersToGroupModal from 'components/add_users_to_group_modal';
import * as Utils from 'utils/utils.jsx';
import {ActionResult} from 'mattermost-redux/types/actions';
import UpdateUserGroupModal from 'components/update_user_group_modal';

export type Props = {
    groupId: string;
    group: Group;
    onExited: () => void;
    backButtonCallback: () => void;
    backButtonAction: () => void;
    permissionToEditGroup: boolean;
    permissionToJoinGroup: boolean;
    permissionToLeaveGroup: boolean;
    permissionToArchiveGroup: boolean;
    isGroupMember: boolean;
    currentUserId: string;
    incrementMemberCount: () => void;
    decrementMemberCount: () => void;
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
        removeUsersFromGroup: (groupId: string, userIds: string[]) => Promise<ActionResult>;
        addUsersToGroup: (groupId: string, userIds: string[]) => Promise<ActionResult>;
        archiveGroup: (groupId: string) => Promise<ActionResult>;
    };
}

const ViewUserGroupModalHeader = (props: Props) => {
    const goToAddPeopleModal = () => {
        const {actions, groupId} = props;

        actions.openModal({
            modalId: ModalIdentifiers.ADD_USERS_TO_GROUP,
            dialogType: AddUsersToGroupModal,
            dialogProps: {
                groupId,
                backButtonCallback: props.backButtonAction,
            },
        });
        props.onExited();
    };

    const goToEditGroupModal = () => {
        const {actions, groupId} = props;

        actions.openModal({
            modalId: ModalIdentifiers.EDIT_GROUP_MODAL,
            dialogType: UpdateUserGroupModal,
            dialogProps: {
                groupId,
                backButtonCallback: props.backButtonAction,
            },
        });
        props.onExited();
    };

    const showSubMenu = (source: string) => {
        const {permissionToEditGroup, permissionToJoinGroup, permissionToLeaveGroup, permissionToArchiveGroup} = props;

        return source.toLowerCase() !== 'ldap' &&
            (
                permissionToEditGroup ||
                permissionToJoinGroup ||
                permissionToLeaveGroup ||
                permissionToArchiveGroup
            );
    };

    const leaveGroup = async (groupId: string) => {
        const {currentUserId, actions, decrementMemberCount} = props;

        await actions.removeUsersFromGroup(groupId, [currentUserId]).then(() => {
            decrementMemberCount();
        });
    };

    const joinGroup = async (groupId: string) => {
        const {currentUserId, actions, incrementMemberCount} = props;

        await actions.addUsersToGroup(groupId, [currentUserId]).then(() => {
            incrementMemberCount();
        });
    };

    const archiveGroup = async (groupId: string) => {
        const {actions} = props;

        await actions.archiveGroup(groupId).then(() => {
            props.backButtonCallback();
            props.onExited();
        });
    };

    const modalTitle = () => {
        const {group} = props;

        if (group) {
            return (
                <Modal.Title
                    componentClass='h1'
                    id='userGroupsModalLabel'
                >
                    {group.display_name}
                </Modal.Title>
            );
        }
        return (<></>);
    };

    const addPeopleButton = () => {
        const {group, permissionToJoinGroup} = props;

        if (group?.source.toLowerCase() !== 'ldap' && permissionToJoinGroup) {
            return (
                <button
                    className='user-groups-create btn btn-md btn-primary'
                    onClick={goToAddPeopleModal}
                >
                    <FormattedMessage
                        id='user_groups_modal.addPeople'
                        defaultMessage='AddPeople'
                    />
                </button>
            );
        }
        return (<></>);
    };

    const subMenuButton = () => {
        const {group, isGroupMember} = props;

        if (group && showSubMenu(group?.source)) {
            return (
                <div className='details-action'>
                    <MenuWrapper
                        isDisabled={false}
                        stopPropagationOnToggle={false}
                        id={`detailsCustomWrapper-${group.id}`}
                    >
                        <button className='action-wrapper btn-icon'>
                            <LocalizedIcon
                                className='icon icon-dots-vertical'
                                ariaLabel={{id: t('user_groups_modal.goBackLabel'), defaultMessage: 'Back'}}
                            />
                        </button>
                        <Menu
                            openLeft={false}
                            openUp={false}
                            ariaLabel={Utils.localizeMessage('admin.user_item.menuAriaLabel', 'User Actions Menu')}
                        >
                            <Menu.ItemAction
                                show={props.permissionToEditGroup}
                                onClick={() => {
                                    goToEditGroupModal();
                                }}
                                text={Utils.localizeMessage('user_groups_modal.editDetails', 'Edit Details')}
                                disabled={false}
                            />
                            <Menu.ItemAction
                                show={props.permissionToJoinGroup && !isGroupMember}
                                onClick={() => {
                                    joinGroup(group.id);
                                }}
                                text={Utils.localizeMessage('user_groups_modal.joinGroup', 'Join Group')}
                                disabled={false}
                            />
                            <Menu.ItemAction
                                show={props.permissionToLeaveGroup && isGroupMember}
                                onClick={() => {
                                    leaveGroup(group.id);
                                }}
                                text={Utils.localizeMessage('user_groups_modal.leaveGroup', 'Leave Group')}
                                disabled={false}
                                isDangerous={true}
                            />
                            <Menu.ItemAction
                                show={props.permissionToArchiveGroup}
                                onClick={() => {
                                    archiveGroup(group.id);
                                }}
                                text={Utils.localizeMessage('user_groups_modal.archiveGroup', 'Archive Group')}
                                disabled={false}
                                isDangerous={true}
                            />
                        </Menu>
                    </MenuWrapper>
                </div>
            );
        }
        return (<></>);
    };

    return (
        <Modal.Header closeButton={true}>
            <button
                type='button'
                className='modal-header-back-button btn-icon'
                aria-label='Close'
                onClick={() => {
                    props.backButtonCallback();
                    props.onExited();
                }}
            >
                <LocalizedIcon
                    className='icon icon-arrow-left'
                    ariaLabel={{id: t('user_groups_modal.goBackLabel'), defaultMessage: 'Back'}}
                />
            </button>
            {modalTitle()}
            {addPeopleButton()}
            {subMenuButton()}
        </Modal.Header>
    );
};

export default ViewUserGroupModalHeader;
