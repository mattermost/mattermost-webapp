// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {ActionFunc, ActionResult} from 'mattermost-redux/types/actions';
import {ChannelWithTeamData} from 'mattermost-redux/types/channels';
import {debounce} from 'mattermost-redux/actions/helpers';

import {browserHistory} from 'utils/browser_history';

import {Constants} from 'utils/constants';
import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';
import {PAGE_SIZE} from 'components/admin_console/team_channel_settings/abstract_list.jsx';
import GlobeIcon from 'components/widgets/icons/globe_icon';
import LockIcon from 'components/widgets/icons/lock_icon';

import './channel_list.scss';
interface ChannelListProps {
    actions: {
        searchAllChannels: (term: string, notAssociatedToGroup?: string, excludeDefaultChannels?: boolean, page?: number, perPage?: number, includeDeleted?: boolean) => Promise<{ data: any }>;
        getData: (page: number, perPage: number, notAssociatedToGroup? : string, excludeDefaultChannels?: boolean, includeDeleted?: boolean) => ActionFunc | ActionResult | Promise<ChannelWithTeamData[]>;
    };
    data: ChannelWithTeamData[];
    total: number;
    removeGroup?: () => void;
    onPageChangedCallback?: () => void;
    emptyListTextId?: string;
    emptyListTextDefaultMessage?: string;
}

interface ChannelListState {
    term: string;
    channels: ChannelWithTeamData[];
    loading: boolean;
    page: number;
    total: number;
    searchErrored: boolean;
}

const ROW_HEIGHT = 40;

export default class ChannelList extends React.PureComponent<ChannelListProps, ChannelListState> {
    constructor(props: ChannelListProps) {
        super(props);
        this.state = {
            loading: false,
            term: '',
            channels: [],
            page: 0,
            total: 0,
            searchErrored: false,
        };
    }

    componentDidMount() {
        this.loadPage();
    }

    getPaginationProps = () => {
        const {page, term} = this.state;
        const total = term === '' ? this.props.total : this.state.total;
        const startCount = (page * PAGE_SIZE) + 1;
        let endCount = (page + 1) * PAGE_SIZE;
        endCount = endCount > total ? total : endCount;
        return {startCount, endCount, total};
    }

    loadPage = async (page = 0, term = '') => {
        this.setState({loading: true, term});

        if (term.length > 0) {
            if (page > 0) {
                this.searchChannels(page, term);
            } else {
                this.searchChannelsDebounced(page, term);
            }
            return;
        }

        await this.props.actions.getData(page, PAGE_SIZE, '', false, true);
        this.setState({page, loading: false});
    }

    searchChannels = async (page = 0, term = '') => {
        let channels = [];
        let total = 0;
        let searchErrored = true;
        const response = await this.props.actions.searchAllChannels(term, '', false, page, PAGE_SIZE, true);
        if (response?.data) {
            channels = page > 0 ? this.state.channels.concat(response.data.channels) : response.data.channels;
            total = response.data.total_count;
            searchErrored = false;
        }
        this.setState({page, loading: false, channels, total, searchErrored});
    }

    searchChannelsDebounced = debounce((page, term) => this.searchChannels(page, term), 300, false, () => {});

    nextPage = () => {
        this.loadPage(this.state.page + 1, this.state.term);
    }

    previousPage = () => {
        this.setState({page: this.state.page - 1});
    }

    search = async (term = '') => {
        this.loadPage(0, term);
    }

    getColumns = (): Column[] => {
        const name: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.nameHeader'
                defaultMessage='Name'
            />
        );
        const team: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.teamHeader'
                defaultMessage='Team'
            />
        );
        const management: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.managementHeader'
                defaultMessage='Management'
            />
        );

        return [
            {
                name,
                field: 'name',
                width: 4,
                fixed: true,
            },
            {
                name: team,
                field: 'team',
                width: 1.5,
                fixed: true,
            },
            {
                name: management,
                field: 'management',
                fixed: true,
            },
            {
                name: '',
                field: 'edit',
                textAlign: 'right',
                fixed: true,
            },
        ];
    }

    getRows = (): Row[] => {
        const {data} = this.props;
        const {term, channels} = this.state;
        const {startCount, endCount} = this.getPaginationProps();
        let channelsToDisplay = term.length > 0 ? channels : data;
        channelsToDisplay = channelsToDisplay.slice(startCount - 1, endCount);

        return channelsToDisplay.map((channel) => {
            return {
                cells: {
                    id: channel.id,
                    name: (
                        <span
                            className='group-name overflow--ellipsis row-content'
                            data-testid='channel-display-name'
                        >
                            {channel.type === Constants.PRIVATE_CHANNEL ? (
                                <LockIcon className='channel-icon channel-icon__lock channel-icon___lowerOpacity'/>
                            ) : (
                                <GlobeIcon className='channel-icon channel-icon__globe channel-icon___lowerOpacity'/>
                            )}
                            <span className='TeamList_channelDisplayName'>
                                {channel.display_name}
                            </span>
                        </span>
                    ),
                    team: (
                        <span className='group-description row-content'>
                            {channel.team_display_name}
                        </span>
                    ),
                    management: (
                        <span className='group-description adjusted row-content'>
                            <FormattedMessage
                                id={`admin.channel_settings.channel_row.managementMethod.${channel.group_constrained ? 'group' : 'manual'}`}
                                defaultMessage={channel.group_constrained ? 'Group Sync' : 'Manual Invites'}
                            />
                        </span>
                    ),
                    edit: (
                        <span
                            className='group-actions TeamList_editRow'
                            data-testid={`${channel.display_name}edit`}
                        >
                            <Link to={`/admin_console/user_management/channels/${channel.id}`} >
                                <FormattedMessage
                                    id='admin.channel_settings.channel_row.configure'
                                    defaultMessage='Edit'
                                />
                            </Link>
                        </span>
                    ),
                },
                onClick: () => browserHistory.push(`/admin_console/user_management/channels/${channel.id}`),
            };
        });
    }

    render = (): JSX.Element => {
        const {term, searchErrored} = this.state;
        const rows: Row[] = this.getRows();
        const columns: Column[] = this.getColumns();
        const {startCount, endCount, total} = this.getPaginationProps();

        let placeholderEmpty: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.no_channels_found'
                defaultMessage='No channels found'
            />
        );

        if (searchErrored) {
            placeholderEmpty = (
                <FormattedMessage
                    id='admin.channel_settings.channel_list.search_channels_errored'
                    defaultMessage='Something went wrong. Try again'
                />
            );
        }

        const rowsContainerStyles = {
            minHeight: `${rows.length * ROW_HEIGHT}px`,
        };

        return (
            <div className='ChannelsList'>
                <DataGrid
                    columns={columns}
                    rows={rows}
                    loading={this.state.loading}
                    page={this.state.page}
                    nextPage={this.nextPage}
                    previousPage={this.previousPage}
                    startCount={startCount}
                    endCount={endCount}
                    total={total}
                    search={this.search}
                    term={term}
                    placeholderEmpty={placeholderEmpty}
                    rowsContainerStyles={rowsContainerStyles}
                />
            </div>
        );
    }
}
