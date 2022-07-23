// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import React, {createRef, RefObject} from 'react';
import {CheckIcon, DotsHorizontalIcon, DotsVerticalIcon, MagnifyIcon} from '@mattermost/compass-icons/components';
import {IconButton, List, ListItem, ListItemText, MenuItem, SelectChangeEvent, Typography} from '@mui/material';

import Modal from 'components/compass/modal/modal';

import Constants from 'utils/constants';

import {Group, GroupSearachParams} from '@mattermost/types/groups';

import './user_groups_modal.scss';
import {debounce} from 'mattermost-redux/actions/helpers';
import Button from '../compass/button/button';
import TextField from '../compass/textfield/textfield';
import ModalTitle from '../compass/modal/modal_title';
import Select from '../compass/select/select';
import ListItemIcon from '../compass/list-item-icon/list-item-icon';

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
        searchGroups: (
            params: GroupSearachParams,
        ) => Promise<{data: Group[]}>;
    };
}

type FilterOptions = 'my' | 'all';

type FilterOptionLabels = {
    [k in FilterOptions]: string;
}

type State = {
    page: number;
    myGroupsPage: number;
    loading: boolean;
    show: boolean;
    selectedFilter: FilterOptions;
    allGroupsFull: boolean;
    myGroupsFull: boolean;
    value: string;
}

export default class UserGroupsModal extends React.PureComponent<Props, State> {
    divScrollRef: RefObject<HTMLDivElement>;
    private searchTimeoutId: number
    private filterOptions: FilterOptions[];
    private filterOptionLabels: FilterOptionLabels;

    constructor(props: Props) {
        super(props);
        this.divScrollRef = createRef();
        this.searchTimeoutId = 0;

        this.filterOptions = ['all', 'my'];

        this.filterOptionLabels = {
            all: 'All Groups',
            my: 'My Groups',
        };

        this.state = {
            page: 0,
            myGroupsPage: 0,
            loading: true,
            show: true,
            selectedFilter: 'all',
            allGroupsFull: false,
            myGroupsFull: false,
            value: '',
        };
    }

    doHide = () => {
        this.props.onExited();
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
                        filter_allow_reference: true,
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

    scrollGetGroups = debounce(
        async () => {
            const {page} = this.state;
            const newPage = page + 1;

            this.setState({page: newPage});
            this.getGroups(newPage);
        },
        500,
        false,
        (): void => {},
    );
    scrollGetMyGroups = debounce(
        async () => {
            const {myGroupsPage} = this.state;
            const newPage = myGroupsPage + 1;

            this.setState({myGroupsPage: newPage});
            this.getMyGroups(newPage);
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
                this.scrollGetGroups();
            }
            if (this.state.selectedFilter !== 'all' && this.props.myGroups.length % GROUPS_PER_PAGE === 0 && this.state.loading === false) {
                this.scrollGetMyGroups();
            }
        }
    }

    getMyGroups = async (page: number) => {
        const {actions} = this.props;

        this.startLoad();
        const data = await actions.getGroupsByUserIdPaginated(this.props.currentUserId, false, page, GROUPS_PER_PAGE, true);
        if (data.data.length === 0) {
            this.setState({myGroupsFull: true});
        }
        this.loadComplete();
        this.setState({selectedFilter: 'my'});
    }

    getGroups = async (page: number) => {
        const {actions} = this.props;

        this.startLoad();
        const data = await actions.getGroups(false, page, GROUPS_PER_PAGE, true);
        if (data.data.length === 0) {
            this.setState({allGroupsFull: true});
        }
        this.loadComplete();
        this.setState({selectedFilter: 'all'});
    }

    render() {
        // const groups = this.state.selectedFilter === 'all' ? this.props.groups : this.props.myGroups;

        // return (
        //     <Modal
        //         isOpen={this.state.show}
        //         dialogId='userGroupsModal'
        //         dialogClassName='a11y__modal user-groups-modal'
        //         onClose={this.doHide}
        //         aria-labelledby='userGroupsModalLabel'
        //         title='User Groups'
        //     >
        //         {(groups.length === 0 && !this.props.searchTerm) ? <NoResultsIndicator
        //             variant={NoResultsVariant.UserGroups}
        //                                                            /> : <>
        //             <div className='user-groups-search'>
        //                                                                    <FaSearchIcon/>
        //                                                                    <Input
        //                     type='text'
        //                     placeholder={Utils.localizeMessage('user_groups_modal.searchGroups', 'Search Groups')}
        //                     onChange={this.handleSearch}
        //                     value={this.props.searchTerm}
        //                     data-testid='searchInput'
        //                     className={'user-group-search-input'}
        //                 />
        //                                                                </div>
        //             <div className='more-modal__dropdown'>
        //                                                                    <MenuWrapper id='groupsFilterDropdown'>
        //                     <a>
        //                                                                            <span>{this.state.selectedFilter === 'all' ? Utils.localizeMessage('user_groups_modal.showAllGroups', 'Show: All Groups') : Utils.localizeMessage('user_groups_modal.showMyGroups', 'Show: My Groups')}</span>
        //                                                                            <span className='icon icon-chevron-down'/>
        //                                                                        </a>
        //                     <Menu
        //                                                                            openLeft={false}
        //                                                                            ariaLabel={Utils.localizeMessage('user_groups_modal.filterAriaLabel', 'Groups Filter Menu')}
        //                                                                        >
        //                                                                            <Menu.ItemAction
        //                             id='groupsDropdownAll'
        //                             buttonClass='groups-filter-btn'
        //                             onClick={() => {
        //                                 this.getGroups(0);
        //                             }}
        //                             text={Utils.localizeMessage('user_groups_modal.allGroups', 'All Groups')}
        //                             rightDecorator={this.state.selectedFilter === 'all' && <i className='icon icon-check'/>}
        //                         />
        //                                                                            <Menu.ItemAction
        //                             id='groupsDropdownMy'
        //                             buttonClass='groups-filter-btn'
        //                             onClick={() => {
        //                                 this.getMyGroups(0);
        //                             }}
        //                             text={Utils.localizeMessage('user_groups_modal.myGroups', 'My Groups')}
        //                             rightDecorator={this.state.selectedFilter !== 'all' && <i className='icon icon-check'/>}
        //                         />
        //                                                                        </Menu>
        //                 </MenuWrapper>
        //                                                                </div>
        //             <UserGroupsList
        //                                                                    groups={groups}
        //                                                                    searchTerm={this.props.searchTerm}
        //                                                                    loading={this.state.loading}
        //                                                                    onScroll={this.onScroll}
        //                                                                    ref={this.divScrollRef}
        //                                                                    onExited={this.props.onExited}
        //                                                                    backButtonAction={this.props.backButtonAction}
        //                                                                />
        //         </>
        //         }
        //     </Modal>
        // );

        const groups = this.state.selectedFilter === 'all' ? this.props.groups : this.props.myGroups;

        console.log('##### props', this.props);
        const handleChange = (e: React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement>) => this.setState({value: e.target.value});
        return (
            <Modal
                isOpen={this.state.show}
                dialogId='userGroupsModal'
                dialogClassName='a11y__modal user-groups-modal'
                onClose={this.doHide}
                aria-labelledby='userGroupsModalLabel'
                onConfirm={() => {}}
            >
                <ModalTitle
                    title={'User Groups'}
                    onClose={this.doHide}
                    rightSection={<Button disableRipple={true}>{'Create user group'}</Button>}
                >
                    <TextField
                        label='Search Groups'
                        id='search_groups_input'
                        fullWidth={true}
                        value={this.state.value}
                        onChange={handleChange}
                        startIcon={(
                            <MagnifyIcon
                                size={18}
                                color={'currentColor'}
                            />
                        )}
                    />
                    <Select
                        variant='standard'
                        multiple={false}
                        value={this.state.selectedFilter}
                        defaultValue={this.filterOptions[0]}
                        renderValue={(selected: FilterOptions) => `Show: ${this.filterOptionLabels[selected]}`}
                        onChange={(event: SelectChangeEvent<FilterOptions>) => this.setState({selectedFilter: event.target.value as FilterOptions})}
                        IconComponent={ChevronDownIcon}
                    >
                        {this.filterOptions.map((option: FilterOptions) => {
                            const isSelected = option === this.state.selectedFilter;
                            return (
                                <MenuItem
                                    key={option}
                                    value={option}
                                    selected={isSelected}
                                >
                                    <ListItemText disableTypography={true}>
                                        {this.filterOptionLabels[option]}
                                    </ListItemText>
                                    {isSelected && (
                                        <ListItemIcon position='end'>
                                            <CheckIcon
                                                size={18}
                                                color={'var(--button-bg)'}
                                            />
                                        </ListItemIcon>
                                    )}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </ModalTitle>
                <List>
                    {groups.map((group) => {
                        const membersText = `${group.member_count} member${group.member_count > 1 ? 's' : ''}`;
                        return (
                            <ListItem
                                key={group.id}
                                secondaryAction={(
                                    <IconButton>
                                        <DotsVerticalIcon
                                            size={18}
                                            color={'currentColor'}
                                        />
                                    </IconButton>
                                )}
                            >
                                <ListItemText disableTypography={true}>
                                    <Typography variant={'body1'}>{group.display_name}</Typography>
                                    <Typography variant={'body2'}>{`@${group.name}`}</Typography>
                                    <Typography variant={'body2'}>{membersText}</Typography>
                                </ListItemText>
                            </ListItem>
                        );
                    })}
                </List>
            </Modal>
        );
    }
}
