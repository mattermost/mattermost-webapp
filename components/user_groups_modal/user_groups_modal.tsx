// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {createRef, RefObject} from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import CheckIcon from '@mattermost/compass-icons/components/check';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import {SelectChangeEvent} from '@mui/material/Select';

import {FormattedMessage} from 'react-intl';

import Modal from 'components/compass/modal/modal';

import Constants, {ModalIdentifiers} from 'utils/constants';
import * as Utils from 'utils/utils';

import {Group, GroupSearachParams} from '@mattermost/types/groups';
import {debounce} from 'mattermost-redux/actions/helpers';

import TextField from '../compass/textfield/textfield';
import ModalTitle from '../compass/modal/modal_title';
import Select from '../compass/select/select';
import ListItemIcon from '../compass/list-item-icon/list-item-icon';
import MenuItem from '../compass/menu-item/menu-item';
import CreateUserGroupsModal from '../create_user_groups_modal';

import UserGroupsList from './user_groups_list';

import {Actions} from './index';

import './user_groups_modal.scss';

const GROUPS_PER_PAGE = 60;

export type Props = {
    onExited: () => void;
    groups: Group[];
    myGroups: Group[];
    searchTerm: string;
    currentUserId: string;
    backButtonAction: () => void;
    actions: Actions;
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
    divScrollRef: RefObject<HTMLUListElement>;
    private searchTimeoutId: number
    private filterOptions: FilterOptions[];
    private filterOptionLabels: FilterOptionLabels;

    constructor(props: Props) {
        super(props);
        this.divScrollRef = createRef();
        this.searchTimeoutId = 0;

        this.filterOptions = ['all', 'my'];

        this.filterOptionLabels = {
            all: Utils.localizeMessage('user_groups_modal.allGroups', 'All Groups'),
            my: Utils.localizeMessage('user_groups_modal.myGroups', 'My Groups'),
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

            this.searchTimeoutId = window.setTimeout(
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
            if (this.state.selectedFilter === 'all' && !this.state.loading && !this.state.allGroupsFull) {
                this.scrollGetGroups();
            }
            if (this.state.selectedFilter !== 'all' && this.props.myGroups.length % GROUPS_PER_PAGE === 0 && !this.state.loading) {
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

    goToCreateModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.USER_GROUPS_CREATE,
            dialogType: CreateUserGroupsModal,
            dialogProps: {
                backButtonCallback: this.props.backButtonAction,
            },
        });
        this.props.onExited();
    };

    render() {
        const groups = this.state.selectedFilter === 'all' ? this.props.groups : this.props.myGroups;
        const handleChange = (e: React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement>) => this.setState({value: e.target.value});

        return (
            <Modal
                isOpen={this.state.show}
                dialogId='userGroupsModal'
                dialogClassName='a11y__modal user-groups-modal'
                onClose={this.doHide}
                aria-labelledby='userGroupsModalLabel'
            >
                <ModalTitle
                    title={Utils.localizeMessage('user_groups_modal.title', 'User Groups')}
                    onClose={this.doHide}
                    rightSection={(
                        <Button onClick={this.goToCreateModal}>
                            <FormattedMessage
                                id='user_groups_modal.createNew'
                                defaultMessage='Create Group'
                            />
                        </Button>
                    )}
                >
                    <TextField
                        label={Utils.localizeMessage('user_groups_modal.searchGroups', 'Search Groups')}
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
                        renderValue={(selected: FilterOptions) => (selected === 'all' ? Utils.localizeMessage('user_groups_modal.showAllGroups', 'Show: All Groups') : Utils.localizeMessage('user_groups_modal.showMyGroups', 'Show: My Groups'))}
                        onChange={(event: SelectChangeEvent<FilterOptions>) => this.setState({selectedFilter: event.target.value as FilterOptions})}
                        IconComponent={ChevronDownIcon}
                        aria-label={Utils.localizeMessage('user_groups_modal.filterAriaLabel', 'Groups Filter Menu')}
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
                <UserGroupsList
                    groups={groups}
                    searchTerm={this.props.searchTerm}
                    loading={this.state.loading}
                    onScroll={this.onScroll}
                    ref={this.divScrollRef}
                    onExited={this.props.onExited}
                    backButtonAction={this.props.backButtonAction}
                />
            </Modal>
        );
    }
}
