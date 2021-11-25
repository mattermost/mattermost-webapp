import React, {RefObject} from 'react';
import {FormattedMessage} from 'react-intl';
import {ModalData} from 'types/actions';
import {ModalIdentifiers} from 'utils/constants';
import {Group} from 'mattermost-redux/types/groups';
import ViewUserGroupModal from 'components/view_user_group_modal';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import * as Utils from 'utils/utils.jsx';
import LoadingScreen from 'components/loading_screen';

type Props = {
    groups: Group[];
    onExited: () => void;
    openModal: <P>(modalData: ModalData<P>) => void;
    onScroll: () => void;
    scrollRef: RefObject<HTMLDivElement>;
    loading: boolean;
    backButtonCallback: () => void;
}

const GroupList = (props: Props) => {
    const goToViewGroupModal = (group: Group) => {
        props.openModal({
            modalId: ModalIdentifiers.VIEW_USER_GROUP,
            dialogType: ViewUserGroupModal,
            dialogProps: {
                groupId: group.id,
                backButtonCallback: props.backButtonCallback,
            },
        });

        props.onExited();
    }

    return (
        <div
            className='user-groups-modal__content user-groups-list'
            onScroll={props.onScroll}
            ref={props.scrollRef}
        >
            {props.groups.map((group) => {
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
                                <div className='text-right'>
                                    <button className='action-wrapper'>
                                        <i className='icon icon-dots-vertical'/>
                                    </button>
                                </div>
                                <Menu
                                    openLeft={true}
                                    openUp={false}
                                    ariaLabel={Utils.localizeMessage('admin.user_item.menuAriaLabel', 'User Actions Menu')}
                                >
                                    <Menu.ItemAction
                                        show={true}
                                        onClick={() => {}}
                                        text={Utils.localizeMessage('user_groups_modal.viewGroup', 'View Group')}
                                        disabled={false}
                                    />
                                    <Menu.ItemAction
                                        show={true}
                                        onClick={() => {}}
                                        text={Utils.localizeMessage('user_groups_modal.joinGroup', 'Join Group')}
                                        disabled={false}
                                    />
                                </Menu>
                            </MenuWrapper>
                        </div>
                    </div>
                );
            })}
            {
                (props.loading) &&
                <LoadingScreen />
            }
        </div>
    );
};

export default GroupList;