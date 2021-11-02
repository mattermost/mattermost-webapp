// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {UserProfile} from 'mattermost-redux/types/users';
import {Channel, ChannelStats, ChannelMembership} from 'mattermost-redux/types/channels';

import Constants, { ModalIdentifiers } from 'utils/constants';
import * as UserAgent from 'utils/user_agent';

import ChannelMembersDropdown from 'components/channel_members_dropdown';
import FaSearchIcon from 'components/widgets/icons/fa_search_icon';
import FaSuccessIcon from 'components/widgets/icons/fa_success_icon';
import * as Utils from 'utils/utils.jsx';
import LoadingScreen from 'components/loading_screen';
import { Group } from 'mattermost-redux/types/groups';
import { Modal } from 'react-bootstrap';
import {browserHistory} from 'utils/browser_history';
import { FormattedMessage } from 'react-intl';

import './user_groups_modal.scss';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import { getCurrentUserId } from 'mattermost-redux/selectors/entities/common';
import { ModalData } from 'types/actions';
import CreateUserGroupsModal from 'components/create_user_groups_modal';

const GROUPS_PER_PAGE = 60;

export type Props = {
    onExited: () => void;
    groups: Group[];
    myGroups: Group[];
    searchTerm: string;
    currentUserId: string;
    actions: {
        getGroups: (
            filterAllowReference?: boolean, 
            page?: number, 
            perPage?:number, 
            includeMemberCount?: boolean
        ) => Promise<{data: Group[]}>;
        setModalSearchTerm: (term: string) => void;
        getGroupsByUserId: (userId: string) => Promise<{data: Group[]}>;
        openModal: <P>(modalData: ModalData<P>) => void;
    };
}

type State = {
    loading: boolean;
    show: boolean;
    selectedFilter: string;
}

export default class UserGroupsModal extends React.PureComponent<Props, State> {
    private searchTimeoutId: number;

    constructor(props: Props) {
        super(props);

        this.searchTimeoutId = 0;

        this.state = {
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
            actions,
        } = this.props;

        await Promise.all([
            actions.getGroups(false, 0, GROUPS_PER_PAGE, true),
            actions.getGroupsByUserId(this.props.currentUserId)
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

    goToCreateModal = () => {
        const {actions} = this.props;

        actions.openModal({
            modalId: ModalIdentifiers.USER_GROUPS_CREATE,
            dialogType: CreateUserGroupsModal,
        });

        this.props.onExited();
    }

    // nextPage = (page: number) => {
    //     this.props.actions.loadProfilesAndTeamMembersAndChannelMembers(page + 1, USERS_PER_PAGE, undefined, undefined, {active: true});
    // }

    // handleSearch = (term: string) => {
    //     this.props.actions.setModalSearchTerm(term);
    // }

    render() {
        if (this.state.loading) {
            return (<LoadingScreen/>);
        }
        let groups = this.state.selectedFilter === 'all' ? this.props.groups : this.props.myGroups;

        return (
            <Modal
                dialogClassName='a11y__modal user-groups-modal'
                show={this.state.show}
                onHide={this.doHide}
                onExited={this.props.onExited}
                role='dialog'
                aria-labelledby='userGroupsModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='userGroupsModalLabel'
                    >
                        <FormattedMessage
                            id='user_groups_modal.title'
                            defaultMessage='User Groups'
                        />
                    </Modal.Title>
                    <a
                        id='test'
                        className='user-groups-create btn btn-md btn-primary'
                        href='#'
                        onClick={this.goToCreateModal}
                    >
                        <FormattedMessage
                            id='user_groups_modal.createNew'
                            defaultMessage='Create Group'
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
                                placeholder={Utils.localizeMessage('search_bar.search', 'Search')}
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
                    <div className='more-modal__dropdown'>
                        <MenuWrapper id='groupsFilterDropdown'>
                            <a>
                                <span>{this.state.selectedFilter === 'all' ? Utils.localizeMessage('user_groups_modal.showAllGroups', 'Show: All Groups') : Utils.localizeMessage('user_groups_modal.showMyGroups', 'Show: My Groups')}</span>
                                <span className='caret'/>
                            </a>
                            <Menu
                                openLeft={false}
                                ariaLabel={Utils.localizeMessage('user_groups_modal.filterAriaLabel', 'Groups Filter Menu')}
                            >
                                <Menu.ItemAction
                                    id='groupsDropdownAll'
                                    buttonClass='groups-filter-btn'
                                    onClick={() => {
                                        this.setState({selectedFilter: 'all'})
                                    }}
                                    text={Utils.localizeMessage('user_groups_modal.allGroups', 'All Groups')}
                                    rightDecorator={this.state.selectedFilter === 'all' ? <FaSuccessIcon /> : ''}
                                />
                                <Menu.ItemAction
                                    id='groupsDropdownMy'
                                    buttonClass='groups-filter-btn'
                                    onClick={() => {
                                        this.setState({selectedFilter: 'my'})
                                    }}
                                    text={Utils.localizeMessage('user_groups_modal.myGroups', 'My Groups')}
                                    rightDecorator={this.state.selectedFilter !== 'all' ? <FaSuccessIcon /> : ''}
                                />
                            </Menu>
                        </MenuWrapper>
                    </div>

                    <div className='user-groups-modal__content'>
                        {groups.map((group) => {
                            return (
                                <div className='group-row'>
                                    <div className='group-display-name'>
                                        {group.display_name}
                                    </div>
                                    <div className='group-name'>
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
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
