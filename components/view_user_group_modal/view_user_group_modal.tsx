// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { createRef, RefObject } from 'react';
import {Tooltip} from 'react-bootstrap';

import {UserProfile} from 'mattermost-redux/types/users';
import {Channel, ChannelStats, ChannelMembership} from 'mattermost-redux/types/channels';

import Constants, { ModalIdentifiers } from 'utils/constants';
import * as UserAgent from 'utils/user_agent';

import ChannelMembersDropdown from 'components/channel_members_dropdown';
import FaSearchIcon from 'components/widgets/icons/fa_search_icon';
import FaSuccessIcon from 'components/widgets/icons/fa_success_icon';
import Avatar from 'components/widgets/users/avatar';
import * as Utils from 'utils/utils.jsx';
import LoadingScreen from 'components/loading_screen';
import { Group } from 'mattermost-redux/types/groups';
import {Modal} from 'react-bootstrap';
import {browserHistory} from 'utils/browser_history';
import { FormattedMessage } from 'react-intl';

import './view_user_group_modal.scss';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import { getCurrentUserId } from 'mattermost-redux/selectors/entities/common';
import { ModalData } from 'types/actions';
import AddUsersToGroupModal from 'components/add_users_to_group_modal';
import { debounce } from 'mattermost-redux/actions/helpers';
import IconButton from '@mattermost/compass-components/components/icon-button';
import OverlayTrigger from 'components/overlay_trigger';
import UserGroupsModal from 'components/user_groups_modal';
import LocalizedIcon from 'components/localized_icon';
import { t } from 'utils/i18n';

const USERS_PER_PAGE = 12;

export type Props = {
    onExited: () => void;
    searchTerm: string;
    groupId: string;
    group: Group;
    users: UserProfile[];
    actions: {
        getGroup: (groupId: string) => Promise<{data: Group}>;
        getUsersInGroup: (groupId: string, page: number, perPage: number) => Promise<{data: UserProfile[]}>;
        setModalSearchTerm: (term: string) => void;
        openModal: <P>(modalData: ModalData<P>) => void;
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

    constructor(props: Props) {
        super(props);

        this.divScrollRef = createRef();

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
            actions.getGroup(groupId),
            actions.getUsersInGroup(groupId,  0, USERS_PER_PAGE)
        ]);
        this.loadComplete();
    }

    componentWillUnmount() {
        // this.props.actions.setModalSearchTerm('');
    }

    componentDidUpdate(prevProps: Props) {
        // if (prevProps.searchTerm !== this.props.searchTerm) {
        //     clearTimeout(this.searchTimeoutId);
        //     const searchTerm = this.props.searchTerm;

        //     if (searchTerm === '') {
        //         this.loadComplete();
        //         this.searchTimeoutId = 0;
        //         return;
        //     }

        //     const searchTimeoutId = window.setTimeout(
        //         async () => {
        //             const {data} = await prevProps.actions.searchProfiles(searchTerm, {team_id: this.props.currentTeamId, in_channel_id: this.props.currentChannelId});

        //             if (searchTimeoutId !== this.searchTimeoutId) {
        //                 return;
        //             }

        //             this.props.actions.loadStatusesForProfilesList(data);
        //             this.props.actions.loadTeamMembersAndChannelMembersForProfilesList(data, this.props.currentTeamId, this.props.currentChannelId).then(({data: membersLoaded}) => {
        //                 if (membersLoaded) {
        //                     this.loadComplete();
        //                 }
        //             });
        //         },
        //         Constants.SEARCH_TIMEOUT_MILLISECONDS,
        //     );

        //     this.searchTimeoutId = searchTimeoutId;
        // }
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
                groupId: groupId,
            },
        });

        this.props.onExited();
    }

    getGroupMembers = debounce(
        async () => {
            const {actions, groupId} = this.props;
            const {page} = this.state;
            const newPage = page+1;

            this.setState({page: newPage})

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
            // TODO: Need to check against number of group users. Can do once field is added to request
            if (this.props.users.length%USERS_PER_PAGE === 0 && this.state.loading === false) {
                this.getGroupMembers();
            }
        }
    }

    render() {
        const {group, users} = this.props;

        const tooltip = (
            <Tooltip id='recentMentions'>
                <FormattedMessage
                    id='channel_header.flagged'
                    defaultMessage='Saved posts'
                />
            </Tooltip>
        );

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

                    
                </Modal.Header>
                <Modal.Body>
                    <div className='user-groups-search'>
                        <div className='user-groups-searchbar'>
                            <span
                                className='user-groups-search-icon'
                                aria-hidden='true'
                            >
                                <FaSearchIcon />
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
                            {'14 Members'}
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
                                    {/* <div className='group-name'>
                                        {'@'}{group.name}
                                    </div>
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
                                    </div> */}
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
