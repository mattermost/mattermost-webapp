// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useCallback} from 'react';

import {FormattedMessage} from 'react-intl';

import {Group, GroupPermissions} from 'mattermost-redux/types/groups';

import NoResultsIndicator from 'components/no_results_indicator';
import {NoResultsVariant} from 'components/no_results_indicator/types';
import LoadingScreen from 'components/loading_screen';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';

import * as Utils from 'utils/utils';
import {ActionResult} from 'mattermost-redux/types/actions';
import {ModalData} from 'types/actions';
import {ModalIdentifiers} from 'utils/constants';
import ViewUserGroupModal from 'components/view_user_group_modal';

export type Props = {
    groups: Group[];
    searchTerm: string;
    loading: boolean;
    groupPermissionsMap: Record<string, GroupPermissions>;
    onScroll: () => void;
    onExited: () => void;
    backButtonAction: () => void;
    actions: {
        archiveGroup: (groupId: string) => Promise<ActionResult>;
        openModal: <P>(modalData: ModalData<P>) => void;
    };
}

const UserGroupsList = React.forwardRef((props: Props, ref?: React.Ref<HTMLDivElement>) => {
    const {
        groups,
        searchTerm,
        loading,
        groupPermissionsMap,
        onScroll,
        backButtonAction,
        onExited,
        actions,
    } = props;

    const archiveGroup = useCallback(async (groupId: string) => {
        await actions.archiveGroup(groupId);
    }, [actions.archiveGroup]);

    const goToViewGroupModal = useCallback((group: Group) => {
        actions.openModal({
            modalId: ModalIdentifiers.VIEW_USER_GROUP,
            dialogType: ViewUserGroupModal,
            dialogProps: {
                groupId: group.id,
                backButtonCallback: backButtonAction,
                backButtonAction: () => {
                    goToViewGroupModal(group);
                },
            },
        });
        onExited();
    }, [actions.openModal, onExited, backButtonAction]);

    return (
        <div
            className='user-groups-modal__content user-groups-list'
            onScroll={onScroll}
            ref={ref}
        >
            {(groups.length === 0 && searchTerm) &&
                <NoResultsIndicator
                    variant={NoResultsVariant.ChannelSearch}
                    titleValues={{channelName: `"${searchTerm}"`}}
                />
            }
            {groups.map((group) => {
                return (
                    <div
                        className='group-row'
                        key={group.id}
                        onClick={() => {
                            goToViewGroupModal(group);
                        }}
                    >
                        <span className='group-display-name'>
                            {group.display_name}
                        </span>
                        <span className='group-name'>
                            {'@'}{group.name}
                        </span>
                        <div className='group-member-count'>
                            <FormattedMessage
                                id='user_groups_modal.memberCount'
                                defaultMessage='{member_count} {member_count, plural, one {member} other {members}}'
                                values={{
                                    member_count: group.member_count,
                                }}
                            />
                        </div>
                        <div className='group-action'>
                            <MenuWrapper
                                isDisabled={false}
                                stopPropagationOnToggle={true}
                                id={`customWrapper-${group.id}`}
                            >
                                <button className='action-wrapper'>
                                    <i className='icon icon-dots-vertical'/>
                                </button>
                                <Menu
                                    openLeft={true}
                                    openUp={false}
                                    className={'group-actions-menu'}
                                    ariaLabel={Utils.localizeMessage('admin.user_item.menuAriaLabel', 'User Actions Menu')}
                                >
                                    <Menu.Group>
                                        <Menu.ItemAction
                                            onClick={() => {
                                                goToViewGroupModal(group);
                                            }}
                                            icon={<i className='icon-account-multiple-outline'/>}
                                            text={Utils.localizeMessage('user_groups_modal.viewGroup', 'View Group')}
                                            disabled={false}
                                        />
                                    </Menu.Group>
                                    <Menu.Group>
                                        <Menu.ItemAction
                                            show={groupPermissionsMap[group.id].can_delete}
                                            onClick={() => {
                                                archiveGroup(group.id);
                                            }}
                                            icon={<i className='icon-archive-outline'/>}
                                            text={Utils.localizeMessage('user_groups_modal.archiveGroup', 'Archive Group')}
                                            disabled={false}
                                            isDangerous={true}
                                        />
                                    </Menu.Group>
                                </Menu>
                            </MenuWrapper>
                        </div>
                    </div>
                );
            })}
            {
                (loading) &&
                <LoadingScreen/>
            }
        </div>
    );
});

export default React.memo(UserGroupsList);
