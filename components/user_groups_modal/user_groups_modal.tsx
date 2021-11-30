// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {createRef, RefObject} from 'react';

import {Modal} from 'react-bootstrap';

import {FormattedMessage} from 'react-intl';

import Constants, {ModalIdentifiers} from 'utils/constants';

import FaSearchIcon from 'components/widgets/icons/fa_search_icon';
import * as Utils from 'utils/utils.jsx';
import {Group, GroupSearachParams} from 'mattermost-redux/types/groups';

import './user_groups_modal.scss';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {ModalData} from 'types/actions';
import {debounce} from 'mattermost-redux/actions/helpers';
import CreateUserGroupsModal from 'components/create_user_groups_modal';
import LoadingScreen from 'components/loading_screen';
import ViewUserGroupModal from 'components/view_user_group_modal';

const GROUPS_PER_PAGE = 60;

export type Props = {
    onExited: () => void;
    groups: Group[];
    myGroups: Group[];
    searchTerm: string;
    currentUserId: string;
    backButtonAction: () => void;
    actions: {
        getGroups: (
            filterAllowReference?: boolean,
            page?: number,
            perPage?: number,
            includeMemberCount?: boolean
        ) => Promise<{data: Group[]}>;
        setModalSearchTerm: (term: string) => void;
        getGroupsByUserIdPaginated: (
            userId: string,
            filterAllowReference?: boolean,
            page?: number,
            perPage?: number,
            includeMemberCount?: boolean
        ) => Promise<{data: Group[]}>;
        openModal: <P>(modalData: ModalData<P>) => void;
        searchGroups: (
            params: GroupSearachParams,
        ) => Promise<{data: Group[]}>;
    };
}

type State = {
    page: number;
    myGroupsPage: number;
    loading: boolean;
    show: boolean;
    selectedFilter: string;
    allGroupsFull: boolean;
    myGroupsFull: boolean;
}

export default class UserGroupsModal extends React.PureComponent<Props, State> {
    private divScrollRef: RefObject<HTMLDivElement>;
    private searchTimeoutId: number

    constructor(props: Props) {
        super(props);

        this.divScrollRef = createRef();
        this.searchTimeoutId = 0;

        this.state = {
            page: 0,
            myGroupsPage: 0,
            loading: true,
            show: true,
            selectedFilter: 'all',
            allGroupsFull: false,
            myGroupsFull: false,
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
            actions.getGroups(false, this.state.page, GROUPS_PER_PAGE, true),
            actions.getGroupsByUserIdPaginated(this.props.currentUserId, false, this.state.myGroupsPage, GROUPS_PER_PAGE, true),
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
                    const params: GroupSearachParams = {
                        q: searchTerm,
                        filter_allow_reference: false,
                        page: this.state.page,
                        per_page: GROUPS_PER_PAGE,
                        include_member_count: true,
                    };
                    if (this.state.selectedFilter === 'all') {
                        await prevProps.actions.searchGroups(params);
                    } else {
                        params.user_id = this.props.currentUserId;
                        await prevProps.actions.searchGroups(params);
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

    backButtonCallback = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.USER_GROUPS,
            dialogType: CreateUserGroupsModal,
        });
    }

    getGroups = debounce(
        async () => {
            const {actions} = this.props;
            const {page} = this.state;
            const newPage = page + 1;

            this.setState({page: newPage});

            const data = await actions.getGroups(false, newPage, GROUPS_PER_PAGE, true);
            if (data.data.length === 0) {
                this.setState({allGroupsFull: true});
            }
            this.loadComplete();
        },
        500,
        false,
        (): void => {},
    );
    getMyGroups = debounce(
        async () => {
            const {actions} = this.props;
            const {myGroupsPage} = this.state;
            const newPage = myGroupsPage + 1;

            this.setState({myGroupsPage: newPage});

            const data = await actions.getGroupsByUserIdPaginated(this.props.currentUserId, false, newPage, GROUPS_PER_PAGE, true);
            if (data.data.length === 0) {
                this.setState({myGroupsFull: true});
            }
            this.loadComplete();
        },
        500,
        false,
        (): void => {},
    );

    onScroll = () => {
        const scrollHeight = this.divScrollRef.current?.scrollHeight || 0;
        const scrollTop = this.divScrollRef.current?.scrollTop || 0;
        const clientHeight = this.divScrollRef.current?.clientHeight || 0;

        if ((scrollTop + clientHeight + 30) >= scrollHeight) {
            if (this.state.selectedFilter === 'all' && this.state.loading === false && !this.state.allGroupsFull) {
                this.startLoad();
                this.getGroups();
            }

            if (this.state.selectedFilter !== 'all' && this.props.myGroups.length % GROUPS_PER_PAGE === 0 && this.state.loading === false) {
                this.startLoad();
                this.getMyGroups();
            }
        }
    }

    goToCreateModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.USER_GROUPS_CREATE,
            dialogType: CreateUserGroupsModal,
            dialogProps: {
                backButtonCallback: this.props.backButtonAction,
            },
        });

        this.props.onExited();
    }

    goToViewGroupModal = (group: Group) => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.VIEW_USER_GROUP,
            dialogType: ViewUserGroupModal,
            dialogProps: {
                groupId: group.id,
                backButtonCallback: this.props.backButtonAction,
                backButtonAction: () => {
                    this.goToViewGroupModal(group);
                },
            },
        });

        this.props.onExited();
    }

    render() {
        const groups = this.state.selectedFilter === 'all' ? this.props.groups : this.props.myGroups;

        return (
            <Modal
                dialogClassName='a11y__modal user-groups-modal'
                show={this.state.show}
                onHide={this.doHide}
                onExited={this.props.onExited}
                role='dialog'
                aria-labelledby='userGroupsModalLabel'
                id='userGroupsModal'
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
                                <FaSearchIcon/>
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
                                        this.setState({selectedFilter: 'all'});
                                    }}
                                    text={Utils.localizeMessage('user_groups_modal.allGroups', 'All Groups')}
                                    rightDecorator={this.state.selectedFilter === 'all' && <i className='icon icon-check'/>}
                                />
                                <Menu.ItemAction
                                    id='groupsDropdownMy'
                                    buttonClass='groups-filter-btn'
                                    onClick={() => {
                                        this.setState({selectedFilter: 'my'});
                                    }}
                                    text={Utils.localizeMessage('user_groups_modal.myGroups', 'My Groups')}
                                    rightDecorator={this.state.selectedFilter !== 'all' && <i className='icon icon-check'/>}
                                />
                            </Menu>
                        </MenuWrapper>
                    </div>

                    <div
                        className='user-groups-modal__content user-groups-list'
                        onScroll={this.onScroll}
                        ref={this.divScrollRef}
                    >
                        {groups.map((group) => {
                            return (
                                <div
                                    className='group-row'
                                    key={group.id}
                                    onClick={() => {
                                        this.goToViewGroupModal(group);
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
                                                className={'group-actions-menu'}
                                                ariaLabel={Utils.localizeMessage('admin.user_item.menuAriaLabel', 'User Actions Menu')}
                                            >
                                                <Menu.Group>
                                                    <Menu.ItemAction
                                                        show={true}
                                                        onClick={() => {
                                                            this.goToViewGroupModal(group);
                                                        }}
                                                        icon={<i className='icon-account-multiple-outline'/>}
                                                        text={Utils.localizeMessage('user_groups_modal.viewGroup', 'View Group')}
                                                        disabled={false}
                                                    />
                                                    <Menu.ItemAction
                                                        show={true}
                                                        onClick={() => {}}
                                                        icon={<i className='icon-account-multiple-outline'/>}
                                                        text={Utils.localizeMessage('user_groups_modal.joinGroup', 'Join Group')}
                                                        disabled={false}
                                                    />
                                                </Menu.Group>
                                                <Menu.Group>
                                                    <Menu.ItemAction
                                                        show={true}
                                                        onClick={() => {}}
                                                        icon={<i className='icon-exit-to-app'/>}
                                                        text={Utils.localizeMessage('user_groups_modal.leaveGroup', 'Leave Group')}
                                                        disabled={false}
                                                        isDangerous={true}
                                                    />
                                                    <Menu.ItemAction
                                                        show={true}
                                                        onClick={() => {}}
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
                            (this.state.loading) &&
                            <LoadingScreen/>
                        }
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
