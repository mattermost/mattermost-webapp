// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {createRef, RefObject} from 'react';

import {Modal} from 'react-bootstrap';

import {FormattedMessage} from 'react-intl';


import {UserProfile} from 'mattermost-redux/types/users';

import Constants, {ModalIdentifiers} from 'utils/constants';

import FaSearchIcon from 'components/widgets/icons/fa_search_icon';
import Avatar from 'components/widgets/users/avatar';
import * as Utils from 'utils/utils.jsx';
import LoadingScreen from 'components/loading_screen';
import {Group} from 'mattermost-redux/types/groups';

import './view_user_group_modal.scss';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {ModalData} from 'types/actions';
import AddUsersToGroupModal from 'components/add_users_to_group_modal';
import {debounce} from 'mattermost-redux/actions/helpers';

import UserGroupsModal from 'components/user_groups_modal';
import LocalizedIcon from 'components/localized_icon';
import {t} from 'utils/i18n';
import UpdateUserGroupModal from 'components/update_user_group_modal';
import {ActionResult} from 'mattermost-redux/types/actions';

const USERS_PER_PAGE = 10;

export type Props = {
    onExited: () => void;
    searchTerm: string;
    groupId: string;
    group: Group;
    users: UserProfile[];
    actions: {
        getGroup: (groupId: string, includeMemberCount: boolean) => Promise<{data: Group}>;
        getUsersInGroup: (groupId: string, page: number, perPage: number) => Promise<{data: UserProfile[]}>;
        setModalSearchTerm: (term: string) => void;
        openModal: <P>(modalData: ModalData<P>) => void;
        searchProfiles: (term: string, options: any) => Promise<ActionResult>;
        removeUsersFromGroup: (groupId: string, userIds: string[]) => Promise<ActionResult>;
    };
}

type State = {
    page: number;
    loading: boolean;
    show: boolean;
    selectedFilter: string;
}

export default class ViewUserGroupModal extends React.PureComponent<Props, State> {
    private divScrollRef: RefObject<HTMLDivElement>;
    private searchTimeoutId: number

    constructor(props: Props) {
        super(props);

        this.divScrollRef = createRef();
        this.searchTimeoutId = 0;

        this.state = {
            page: 0,
            loading: true,
            show: true,
            selectedFilter: 'all',
        };
    }

    doHide = () => {
        this.setState({show: false});
    }

    async componentDidMount() {
        const {
            groupId,
            actions,
        } = this.props;

        await Promise.all([
            actions.getGroup(groupId, true),
            actions.getUsersInGroup(groupId, 0, USERS_PER_PAGE),
        ]);
        this.loadComplete();
    }

    componentWillUnmount() {
        this.props.actions.setModalSearchTerm('');
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.searchTerm !== this.props.searchTerm) {
            clearTimeout(this.searchTimeoutId);
            const searchTerm = this.props.searchTerm;

            if (searchTerm === '') {
                this.loadComplete();
                this.searchTimeoutId = 0;
                return;
            }

            const searchTimeoutId = window.setTimeout(
                async () => {
                    await prevProps.actions.searchProfiles(searchTerm, {in_group_id: this.props.groupId})

                    if (searchTimeoutId !== this.searchTimeoutId) {
                        return;
                    }
                },
                Constants.SEARCH_TIMEOUT_MILLISECONDS,
            );

            this.searchTimeoutId = searchTimeoutId;
        }
    }

    startLoad = () => {
        this.setState({loading: true});
    }

    loadComplete = () => {
        this.setState({loading: false});
    }

    handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        this.props.actions.setModalSearchTerm(term);
    }

    resetSearch = () => {
        this.props.actions.setModalSearchTerm('');
    };

    goToGroupsModal = () => {
        const {actions} = this.props;

        actions.openModal({
            modalId: ModalIdentifiers.USER_GROUPS,
            dialogType: UserGroupsModal,
        });

        this.props.onExited();
    }

    goToAddPeopleModal = () => {
        const {actions, groupId} = this.props;

        actions.openModal({
            modalId: ModalIdentifiers.ADD_USERS_TO_GROUP,
            dialogType: AddUsersToGroupModal,
            dialogProps: {
                groupId,
            },
        });

        this.props.onExited();
    }

    goToEditGroupModal = () => {
        const {actions, groupId} = this.props;

        actions.openModal({
            modalId: ModalIdentifiers.EDIT_GROUP_MODAL,
            dialogType: UpdateUserGroupModal,
            dialogProps: {
                groupId,
            },
        });

        this.props.onExited();
    }

    getGroupMembers = debounce(
        async () => {
            const {actions, groupId} = this.props;
            const {page} = this.state;
            const newPage = page + 1;

            this.setState({page: newPage});

            this.startLoad();
            await actions.getUsersInGroup(groupId, newPage, USERS_PER_PAGE);
            this.loadComplete();
        },
        200,
        false,
        (): void => {},
    );

    onScroll = () => {
        const scrollHeight = this.divScrollRef.current?.scrollHeight || 0;
        const scrollTop = this.divScrollRef.current?.scrollTop || 0;
        const clientHeight = this.divScrollRef.current?.clientHeight || 0;

        if ((scrollTop + clientHeight + 30) >= scrollHeight) {
            if (this.props.users.length !== this.props.group.member_count && this.state.loading === false) {
                this.getGroupMembers();
            }
        }
    }

    removeUserFromGroup = async (userId: string) => {
        const {groupId, actions} = this.props;

        await actions.removeUsersFromGroup(groupId, [userId])
    }

    render() {
        const {group, users} = this.props;

        return (
            <Modal
                dialogClassName='a11y__modal view-user-groups-modal'
                show={this.state.show}
                onHide={this.doHide}
                onExited={this.props.onExited}
                role='dialog'
                aria-labelledby='viewUserGroupModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <button
                        type='button'
                        className='modal-header-back-button btn-icon'
                        aria-label='Close'
                        onClick={() => {
                            this.goToGroupsModal();
                        }}
                    >
                        <LocalizedIcon
                            className='icon icon-arrow-left'
                            ariaLabel={{id: t('user_groups_modal.goBackLabel'), defaultMessage: 'Back'}}
                        />
                    </button>
                    <Modal.Title
                        componentClass='h1'
                        id='userGroupsModalLabel'
                    >
                        {group.display_name}
                    </Modal.Title>
                    {
                        group.source.toLowerCase() !== 'ldap' && 
                        <a
                            id='test'
                            className='btn btn-md btn-primary'
                            href='#'
                            onClick={this.goToAddPeopleModal}
                        >
                            <FormattedMessage
                                id='user_groups_modal.addPeople'
                                defaultMessage='AddPeople'
                            />
                        </a>
                    }
                    {
                        group.source.toLowerCase() !== 'ldap' && 
                        <div className='details-action'>
                            <MenuWrapper
                                isDisabled={false}
                                stopPropagationOnToggle={false}
                                id={`detailsCustomWrapper-${group.id}`}
                            >
                                <div className='text-right'>
                                    <button className='action-wrapper'>
                                        <i className='icon icon-dots-vertical'/>
                                    </button>
                                </div>
                                <Menu
                                    openLeft={false}
                                    openUp={false}
                                    ariaLabel={Utils.localizeMessage('admin.user_item.menuAriaLabel', 'User Actions Menu')}
                                >
                                    <Menu.ItemAction
                                        show={true}
                                        onClick={() => {
                                            this.goToEditGroupModal();
                                        }}
                                        text={Utils.localizeMessage('user_groups_modal.editDetails', 'Edit Details')}
                                        disabled={false}
                                    />
                                </Menu>
                            </MenuWrapper>
                        </div>
                    }
                </Modal.Header>
                <Modal.Body>
                    <div className='group-mention-name'>
                        <span className='group-name'>{`@${group.name}`}</span>
                        {
                            group.source.toLowerCase() === 'ldap' && 
                            <span className='group-source'>
                                <FormattedMessage
                                    id='view_user_group_modal.ldapSynced'
                                    defaultMessage='AD/LDAP SYNCED'
                                />
                            </span>
                        }
                    </div>
                    <div className='user-groups-search'>
                        <div className='user-groups-searchbar'>
                            <span
                                className='user-groups-search-icon'
                                aria-hidden='true'
                            >
                                <FaSearchIcon/>
                            </span>

                            <input
                                type='text'
                                placeholder={Utils.localizeMessage('search_bar.searchGroupMembers', 'Search group members')}
                                onChange={this.handleSearch}
                                value={this.props.searchTerm}
                                data-testid='searchInput'
                            />
                            <i
                                className={'user-groups-clear-button fa fa-times-circle ' + (this.props.searchTerm.length ? '' : 'hidden')}
                                onClick={this.resetSearch}
                                data-testid='clear-search'
                            />
                        </div>
                    </div>
                    <div
                        className='user-groups-modal__content group-member-list'
                        onScroll={this.onScroll}
                        ref={this.divScrollRef}
                    >
                        <h2 className='group-member-count'>
                            <FormattedMessage
                                id='view_user_group_modal.memberCount'
                                defaultMessage='{member_count} {member_count, plural, one {Member} other {Members}}'
                                values={{
                                    member_count: group.member_count,
                                }}
                            />
                        </h2>
                        {users.map((user) => {
                            return (
                                <div
                                    key={user.id}
                                    className='group-member-row'
                                >
                                    <>
                                        <Avatar
                                            username={user.username}
                                            size={'sm'}
                                            url={Utils.imageURLForUser(user?.id ?? '')}
                                            className={'avatar-post-preview'}
                                        />
                                    </>
                                    <div className='group-member-name'>
                                        {Utils.getFullName(user)}
                                    </div>
                                    <div className='group-member-username'>
                                        {`@${user.username}`}
                                    </div>
                                    {
                                        group.source.toLowerCase() !== 'ldap' && 
                                        <button
                                            type='button'
                                            className='remove-group-member btn-icon'
                                            aria-label='Close'
                                            onClick={() => {
                                                this.removeUserFromGroup(user.id);
                                            }}
                                        >
                                            <LocalizedIcon
                                                className='icon icon-trash-can-outline'
                                                ariaLabel={{id: t('user_groups_modal.goBackLabel'), defaultMessage: 'Back'}}
                                            />
                                        </button>
                                    }
                                </div>
                            );
                        })}
                        {
                            this.state.loading &&
                            <LoadingScreen/>
                        }
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
