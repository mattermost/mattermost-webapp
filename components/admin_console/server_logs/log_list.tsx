// // Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// // See LICENSE.txt for license information.

// import { Grid } from 'gridjs-react';
// import { html } from "gridjs";
// import React from 'react';
// import {FormattedMessage} from 'react-intl';

// import LocalizedIcon from 'components/localized_icon';
// import NextIcon from 'components/widgets/icons/fa_next_icon';

// import {t} from 'utils/i18n';

// const NEXT_BUTTON_TIMEOUT = 500;

// type Props = {
//     logs: any[string],
//     page: number;
//     perPage: number;
//     nextPage: () => void;
//     previousPage: () => void;
// };

// type State = {
//     nextDisabled: boolean;
// };

// export default class Logs extends React.PureComponent<Props, State> {
//     private logPanel: React.RefObject<HTMLDivElement>;

//     constructor(props: Props) {
//         super(props);

//         this.logPanel = React.createRef();

//         this.state = {
//             nextDisabled: false,
//         };
//     }

//     componentDidMount() {
//         // Scroll Down to get the latest logs
//         const node = this.logPanel.current;
//         if (node) {
//             node.scrollTop = node.scrollHeight;
//         }
//     }

//     componentDidUpdate() {
//         // Scroll Down to get the latest logs
//         const node = this.logPanel.current;
//         if (node) {
//             node.scrollTop = node.scrollHeight;
//         }
//     }

//     nextPage = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
//         e.preventDefault();

//         this.setState({nextDisabled: true});
//         setTimeout(() => this.setState({nextDisabled: false}), NEXT_BUTTON_TIMEOUT);

//         this.props.nextPage();
//     }

//     previousPage = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
//         e.preventDefault();

//         this.props.previousPage();
//     }

//     render() {
//         let content = null;
//         let nextButton;
//         let previousButton;

//         let logData = []
//         for (const serverName in this.props.logs) {
//             console.log(serverName);
//             for (let i = 0; i < this.props.logs[serverName].length; i++) {
//                 let logEntry = {...this.props.logs[serverName][i]}
//                 logEntry["node"] =serverName
//                 logData.push(logEntry);
//             }
//         }

//         if (logData.length >= this.props.perPage) {
//             nextButton = (
//                 <button
//                     type='button'
//                     className='btn btn-default filter-control filter-control__next pull-right'
//                     onClick={this.nextPage}
//                     disabled={this.state.nextDisabled}
//                 >
//                     <FormattedMessage
//                         id='admin.logs.next'
//                         defaultMessage='Next'
//                     />
//                     <NextIcon additionalClassName='ml-2'/>
//                 </button>
//             );
//         }

//         if (this.props.page > 0) {
//             previousButton = (
//                 <button
//                     type='button'
//                     className='btn btn-default filter-control filter-control__prev'
//                     onClick={this.previousPage}
//                 >
//                     <LocalizedIcon
//                         className='fa fa-angle-left'
//                         title={{id: t('generic_icons.previous'), defaultMessage: 'Previous Icon'}}
//                     />
//                     <FormattedMessage
//                         id='admin.logs.prev'
//                         defaultMessage='Previous'
//                     />
//                 </button>
//             );
//         }

//         content = [];

//         for (let i = 0; i < this.props.logs.length; i++) {
//             const style: React.CSSProperties = {
//                 whiteSpace: 'nowrap',
//                 fontFamily: 'monospace',
//                 color: '',
//             };

//             if (this.props.logs[i].indexOf('[EROR]') > 0) {
//                 style.color = 'red';
//             }

//             content.push(<br key={'br_' + i}/>);
//             content.push(
//                 <span
//                     key={'log_' + i}
//                     style={style}
//                 >
//                     {this.props.logs[i]}
//                 </span>,
//             );
//         }

//         console.log(logData);

//         return (
//             <div>

//                 <div
//                     tabIndex={-1}
//                     ref={this.logPanel}
//                     className='log__panel'
//                 >
//                     <Grid
//                         data={logData}
//                         columns = {[
//                             {
//                                 id: 'timestamp',
//                                 name: 'Timestamp',
//                                 width: '300px'
//                             },
//                             {
//                                 id: 'node',
//                                 name: 'Node'
//                             },
//                             {
//                                 id: 'level',
//                                 name: 'Level',
//                                 width: '100px'
//                             }, {
//                                 id: 'msg',
//                                 name: 'Message'
//                             }, {
//                                 id: 'caller',
//                                 name: 'Caller'
//                             }, {
//                                 id: 'options',
//                                 name: 'Options',
//                                 formatter: (_, row) => html(`<button class="log-list-button-full-event">Full Event</button>`)
//                             }]}
//                         sort={true}
//                         search={true}
//                         pagination={{
//                             enabled: true,
//                             limit: 150,
//                         }}
//                     />
//                     {content}
//                 </div>
//                 <div className='pt-3 pb-3 filter-controls'>
//                     {previousButton}
//                     {nextButton}
//                 </div>
//             </div>
//         );
//     }
// }

// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {ActionFunc, ActionResult} from 'mattermost-redux/types/actions';
import {ChannelWithTeamData, ChannelSearchOpts} from '@mattermost/types/channels';
import {debounce} from 'mattermost-redux/actions/helpers';

import {browserHistory} from 'utils/browser_history';
import {trackEvent} from 'actions/telemetry_actions.jsx';

import {Constants} from 'utils/constants';
import {isArchivedChannel} from 'utils/channel_utils';
import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';
import {FilterOptions} from 'components/admin_console/filter/filter';
import TeamFilterDropdown from 'components/admin_console/filter/team_filter_dropdown';
import {PAGE_SIZE} from 'components/admin_console/team_channel_settings/abstract_list';
import GlobeIcon from 'components/widgets/icons/globe_icon';
import LockIcon from 'components/widgets/icons/lock_icon';
import ArchiveIcon from 'components/widgets/icons/archive_icon';
import SharedChannelIndicator from 'components/shared_channel_indicator';

const NEXT_BUTTON_TIMEOUT = 500;

type Props = {
    logs: any[string],
};

type State = {
};

export default class LogList extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loading: false,
            term: {},
            filters: {}
        };
    }

    componentDidMount() {
        this.loadPage();
    }

    isSearching = (term: string, filters: ChannelSearchOpts) => {
        // return term.length > 0 || Object.keys(filters).length > 0;
    }

    loadPage = async (page = 0, term = '', filters = {}) => {
        this.setState({loading: true, term, filters});

        // await this.props.actions.getData(page, PAGE_SIZE, '', false, true);
        // this.setState({page, loading: false});
    }


    onSearch = async (term = '') => {
        // this.loadPage(0, term, this.state.filters);
    }

    getColumns = (): Column[] => {
        const time: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.nameHeader'
                defaultMessage='Time'
            />
        );
        const node: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.teamHeader'
                defaultMessage='Node'
            />
        );
        const level: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.managementHeader'
                defaultMessage='Level'
            />
        );
        const message: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.teamHeader'
                defaultMessage='Message'
            />
        );
        const caller: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.teamHeader'
                defaultMessage='Caller'
            />
        );
        const options: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.teamHeader'
                defaultMessage='Node'
            />
        );

        return [
            {
                name: time,
                field: 'time',
                width: 4,
                fixed: true,
            },
            {
                name: node,
                field: 'node',
                width: 1.5,
                fixed: true,
            },
            {
                name: level,
                field: 'level',
                fixed: true,
            },
            {
                name: message,
                field: 'message',
                textAlign: 'right',
                fixed: true,
            },
            {
                name: caller,
                field: 'caller',
                textAlign: 'right',
                fixed: true,
            },
            {
                name: options,
                field: 'options',
                textAlign: 'right',
                fixed: true,
            },
        ];
    }

    getRows = (): Row[] => {
        let logData = [];
        let content = [];
        for (const serverName in this.props.logs) {
            console.log(serverName);
            for (let i = 0; i < this.props.logs[serverName].length; i++) {
                let logEntry = {...this.props.logs[serverName][i]}
                logEntry["node"] =serverName
                logData.push(logEntry);
            }
        }

        console.log(this.props.logs);
        const {channels, term, filters} = this.state;

        return logData.map((log) => {
            let iconToDisplay = <GlobeIcon className='channel-icon'/>;

            if (channel.type === Constants.PRIVATE_CHANNEL) {
                iconToDisplay = <LockIcon className='channel-icon'/>;
            }

            if (isArchivedChannel(channel)) {
                iconToDisplay = (
                    <ArchiveIcon
                        className='channel-icon'
                        data-testid={`${channel.name}-archive-icon`}
                    />
                );
            }

            if (channel.shared) {
                iconToDisplay = (
                    <SharedChannelIndicator
                        className='channel-icon'
                        channelType={channel.type}
                    />
                );
            }

            return {
                cells: {
                    id: channel.id,
                    name: (
                        <span
                            className='group-name overflow--ellipsis row-content'
                            data-testid='channel-display-name'
                        >
                            {iconToDisplay}
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
                            data-testid={`${channel.name}edit`}
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

    onFilter = () => {}

    render = (): JSX.Element => {
        const {term, searchErrored} = this.state;
        const rows: Row[] = this.getRows();
        const columns: Column[] = this.getColumns();

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
            minHeight: `${rows.length * 40}px`,
        };

        const filterOptions = {};
        const filterProps = {};

        return (
            <div className='ChannelsList'>
                <DataGrid
                    columns={columns}
                    rows={rows}
                    loading={this.state.loading}
                    // startCount={startCount}
                    // endCount={endCount}
                    // total={total}
                    onSearch={this.onSearch}
                    // term={term}
                    // placeholderEmpty={placeholderEmpty}
                    rowsContainerStyles={rowsContainerStyles}
                    // filterProps={filterProps}
                />
            </div>
        );
    }
}
