// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {createRef, RefObject} from 'react';
import {FormattedMessage} from 'react-intl';
import ReactSelect from 'react-select';

import {AdminConfig} from 'mattermost-redux/types/config';
import {DataRetentionCustomPolicies, DataRetentionCustomPolicy} from 'mattermost-redux/types/data_retention';

import {JobTypes} from 'utils/constants';
import DataGrid, {Row} from 'components/admin_console/data_grid/data_grid';
import Card from 'components/card/card';
import TitleAndButtonCardHeader from 'components/card/title_and_button_card_header/title_and_button_card_header';

import JobsTable from 'components/admin_console/jobs';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {browserHistory} from 'utils/browser_history';
import {Job, JobType} from 'mattermost-redux/types/jobs';
import {ActionResult} from 'mattermost-redux/types/actions';
import './data_retention_settings.scss';

type Props = {
    config: AdminConfig;
    customPolicies: DataRetentionCustomPolicies;
    customPoliciesCount: number;
    actions: {
        getDataRetentionCustomPolicies: (page: number) => Promise<{ data: DataRetentionCustomPolicies }>;
        createJob: (job: Job) => Promise<{ data: any }>;
        getJobsByType: (job: JobType) => Promise<{ data: any}>;
        deleteDataRetentionCustomPolicy: (id: string) => Promise<ActionResult>;
        updateConfig: (config: Record<string, any>) => Promise<{ data: any}>;
    };
};

type State = {
    customPoliciesLoading: boolean;
    page: number;
    loading: boolean;
    showEditJobTime: boolean;
}
const PAGE_SIZE = 10;
export default class DataRetentionSettings extends React.PureComponent<Props, State> {
    inputRef: RefObject<HTMLSelectElement>;
    constructor(props: Props) {
        super(props);
        this.inputRef = createRef();
        this.state = {
            customPoliciesLoading: true,
            page: 0,
            loading: false,
            showEditJobTime: false,
        };
    }

    deleteCustomPolicy = async (id: string) => {
        await this.props.actions.deleteDataRetentionCustomPolicy(id);
        this.loadPage(0);
    }

    getGlobalPolicyColumns = () => {
        return [
            {
                name: (
                    <FormattedMessage
                        id='admin.data_retention.globalPoliciesTable.description'
                        defaultMessage='Description'
                    />
                ),
                field: 'description',
            },
            {
                name: (
                    <FormattedMessage
                        id='admin.data_retention.globalPoliciesTable.channelMessages'
                        defaultMessage='Channel messages'
                    />
                ),
                field: 'channel_messages',
            },
            {
                name: (
                    <FormattedMessage
                        id='admin.data_retention.globalPoliciesTable.files'
                        defaultMessage='Files'
                    />
                ),
                field: 'files',
            },
            {
                name: '',
                field: 'actions',
                className: 'actionIcon',
            },
        ];
    }
    getCustomPolicyColumns = () => {
        return [
            {
                name: (
                    <FormattedMessage
                        id='admin.data_retention.customPoliciesTable.description'
                        defaultMessage='Description'
                    />
                ),
                field: 'description',
            },
            {
                name: (
                    <FormattedMessage
                        id='admin.data_retention.customPoliciesTable.channelMessages'
                        defaultMessage='Channel messages'
                    />
                ),
                field: 'channel_messages',
            },
            {
                name: (
                    <FormattedMessage
                        id='admin.data_retention.customPoliciesTable.appliedTo'
                        defaultMessage='Applied to'
                    />
                ),
                field: 'applied_to',
            },
            {
                name: '',
                field: 'actions',
                className: 'actionIcon',
            },
        ];
    }
    getGlobalPolicyRows = () => {
        const {DataRetentionSettings} = this.props.config;
        return [{
            cells: {
                description: 'Applies to all teams and channels, but does not apply to custom retention policies.',
                channel_messages: DataRetentionSettings.EnableMessageDeletion ? `${DataRetentionSettings.MessageRetentionDays} days` : 'Keep Forever',
                files: DataRetentionSettings.EnableFileDeletion ? `${DataRetentionSettings.FileRetentionDays} days` : 'Keep Forever',
                actions: (
                    <MenuWrapper
                        isDisabled={false}
                    >
                        <div className='text-right'>
                            <a>
                                <i className='icon icon-dots-vertical'/>
                            </a>
                        </div>
                        <Menu
                            openLeft={false}
                            openUp={false}
                            ariaLabel={'User Actions Menu'}
                        >
                            <Menu.ItemAction
                                show={true}
                                onClick={() => {
                                    browserHistory.push('/admin_console/compliance/data_retention/global_policy');
                                }}
                                text={'Edit'}
                                disabled={false}
                            />
                        </Menu>
                    </MenuWrapper>
                ),
            },

            // onClick: () => {
            //     browserHistory.push(`/admin_console/compliance/global_data_retention`);
            // }
        }];
    }
    getChannelAndTeamCounts = (policy: DataRetentionCustomPolicy): string => {
        if (policy.channel_count === 0 && policy.team_count === 0) {
            return 'N/A';
        }
        let appliedTo = '';
        if (policy.team_count > 0) {
            appliedTo = `${policy.team_count} team`;
            if (policy.team_count > 1) {
                appliedTo += 's';
            }
        }
        if (policy.channel_count > 0 && policy.team_count > 0) {
            appliedTo += ', ';
        }
        if (policy.channel_count > 0) {
            appliedTo += `${policy.channel_count} channel`;
            if (policy.channel_count > 1) {
                appliedTo += 's';
            }
        }

        return appliedTo;
    }
    getCustomPolicyRows = (): Row[] => {
        return Object.values(this.props.customPolicies).map((policy: any) => {
            return {
                cells: {
                    description: policy.display_name,
                    channel_messages: policy.post_duration === -1 ? 'Keep forever' : `${policy.post_duration} days`,
                    applied_to: this.getChannelAndTeamCounts(policy),
                    actions: (
                        <MenuWrapper
                            isDisabled={false}
                        >
                            <div className='text-right'>
                                <a>
                                    <i className='icon icon-dots-vertical'/>
                                </a>
                            </div>
                            <Menu
                                openLeft={false}
                                openUp={false}
                                ariaLabel={'User Actions Menu'}
                            >
                                <Menu.ItemAction
                                    show={true}
                                    onClick={() => {
                                        browserHistory.push(`/admin_console/compliance/data_retention/custom_policy/${policy.id}`);
                                    }}
                                    text={'Edit'}
                                    disabled={false}
                                />
                                <Menu.ItemAction
                                    show={true}
                                    onClick={() => {
                                        this.deleteCustomPolicy(policy.id);
                                    }}
                                    text={'Delete'}
                                    disabled={false}
                                />
                            </Menu>
                        </MenuWrapper>
                    ),
                },
            };
        });
    };
    private loadPage = async (page: number) => {
        this.setState({customPoliciesLoading: true});
        await this.props.actions.getDataRetentionCustomPolicies(page);
        this.setState({page, customPoliciesLoading: false});
    }
    componentDidMount = async () => {
        await this.loadPage(this.state.page);
    }

    private nextPage = () => {
        this.loadPage(this.state.page + 1);
    }

    private previousPage = () => {
        this.loadPage(this.state.page - 1);
    }

    public getPaginationProps = (): {startCount: number; endCount: number; total: number} => {
        const {page} = this.state;
        const startCount = (page * PAGE_SIZE) + 1;
        const total = this.props.customPoliciesCount;
        let endCount = (page + 1) * PAGE_SIZE;
        endCount = endCount > total ? total : endCount;

        return {startCount, endCount, total};
    }

    showEditJobTime = (value: boolean) => {
        this.setState({showEditJobTime: value});
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        if (prevState.showEditJobTime !== this.state.showEditJobTime && this.state.showEditJobTime) {
            this.inputRef.current?.focus();
        }
    }

    handleCreateJob = async (e: any) => {
        e.preventDefault();
        const job = {
            type: JobTypes.DATA_RETENTION,
        };

        await this.props.actions.createJob(job);
        await this.props.actions.getJobsByType(JobTypes.DATA_RETENTION);
    };

    getJobTimeOptions = () => {
        const minuteIntervals = ['00', '15', '30', '45'];
        const options = [];
        for (let i = 0; i < minuteIntervals.length; i++) {
            options.push({label: `12:${minuteIntervals[i]}am`, value: `00:${minuteIntervals[i]}`});
        }
        for (let h = 1; h < 13; h++) {
            let hour = `${h}`;
            if (h < 10) {
                hour = `0${hour}`;
            }
            for (let i = 0; i < minuteIntervals.length; i++) {
                const timeOfDay = h === 12 ? 'pm' : 'am';
                options.push({label: `${h}:${minuteIntervals[i]}${timeOfDay}`, value: `${hour}:${minuteIntervals[i]}`});
            }
        }

        for (let h = 1; h < 12; h++) {
            for (let i = 0; i < minuteIntervals.length; i++) {
                options.push({label: `${h}:${minuteIntervals[i]}pm`, value: `${h + 12}:${minuteIntervals[i]}`});
            }
        }

        return options;
    }

    changeJobTimeConfig = async (value: string) => {
        const newConfig = JSON.parse(JSON.stringify(this.props.config));
        newConfig.DataRetentionSettings.DeletionJobStartTime = value;

        await this.props.actions.updateConfig(newConfig);
        this.inputRef.current?.blur();
    }

    getJobStartTime = (): string => {
        const {DeletionJobStartTime} = this.props.config.DataRetentionSettings;
        const hour = DeletionJobStartTime.split(':');
        if (parseInt(hour[0], 10) < 12) {
            return `${DeletionJobStartTime} AM`;
        }
        return `${parseInt(hour[0], 10) - 12}:${hour[1]} PM`;
    }

    render = () => {
        const {EnableFileDeletion, EnableMessageDeletion} = this.props.config.DataRetentionSettings;
        const {startCount, endCount, total} = this.getPaginationProps();

        return (
            <div className='wrapper--fixed DataRetentionSettings'>
                <div className='admin-console__header'>
                    <FormattedMessage
                        id='admin.data_retention.title'
                        defaultMessage='Data Retention Policy'
                    />
                </div>
                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <Card
                            expanded={true}
                            className={'console'}
                        >
                            <Card.Header>
                                <TitleAndButtonCardHeader
                                    title={
                                        <FormattedMessage
                                            id='admin.data_retention.globalPolicy.title'
                                            defaultMessage='Global retention policy'
                                        />
                                    }
                                    subtitle={
                                        <FormattedMessage
                                            id='admin.data_retention.globalPolicy.subTitle'
                                            defaultMessage='Keep messages and files for a set amount of time.'
                                        />
                                    }
                                />
                            </Card.Header>
                            <Card.Body>
                                <DataGrid
                                    columns={this.getGlobalPolicyColumns()}
                                    rows={this.getGlobalPolicyRows()}
                                    loading={false}
                                    page={0}
                                    nextPage={() => {}}
                                    previousPage={() => {}}
                                    startCount={1}
                                    endCount={4}
                                    total={0}
                                    className={'customTable'}
                                />
                            </Card.Body>
                        </Card>
                        <Card
                            expanded={true}
                            className={'console'}
                        >
                            <Card.Header>
                                <TitleAndButtonCardHeader
                                    title={
                                        <FormattedMessage
                                            id='admin.data_retention.customPolicies.title'
                                            defaultMessage='Custom retention policies'
                                        />
                                    }
                                    subtitle={
                                        <FormattedMessage
                                            id='admin.data_retention.customPolicies.subTitle'
                                            defaultMessage='Customize how long specific teams and channels will keep messages.'
                                        />
                                    }
                                    buttonText={
                                        <FormattedMessage
                                            id='admin.data_retention.customPolicies.addPolicy'
                                            defaultMessage='Add policy'
                                        />
                                    }
                                    onClick={() => {
                                        browserHistory.push('/admin_console/compliance/data_retention/custom_policy');
                                    }}
                                />
                            </Card.Header>
                            <Card.Body>
                                <DataGrid
                                    columns={this.getCustomPolicyColumns()}
                                    rows={this.getCustomPolicyRows()}
                                    loading={this.state.customPoliciesLoading}
                                    page={this.state.page}
                                    nextPage={this.nextPage}
                                    previousPage={this.previousPage}
                                    startCount={startCount}
                                    endCount={endCount}
                                    total={total}
                                    className={'customTable'}
                                />
                            </Card.Body>
                        </Card>
                        <Card
                            expanded={true}
                            className={'console'}
                        >
                            <Card.Header>
                                <TitleAndButtonCardHeader
                                    title={
                                        <FormattedMessage
                                            id='admin.data_retention.jobCreation.title'
                                            defaultMessage='Policy log'
                                        />
                                    }
                                    subtitle={
                                        <FormattedMessage
                                            id='admin.data_retention.jobCreation.subTitle'
                                            defaultMessage='Daily log of messages and files removed based on the policies defined above.'
                                        />
                                    }
                                    buttonText={
                                        <FormattedMessage
                                            id='admin.data_retention.createJob.title'
                                            defaultMessage='Run Deletion Job Now'
                                        />
                                    }
                                    onClick={this.handleCreateJob}
                                />
                            </Card.Header>
                            <Card.Body>
                                <JobsTable
                                    jobType={JobTypes.DATA_RETENTION}
                                    hideJobCreateButton={true}
                                    className={'job-table__data-retention'}
                                    disabled={String(EnableMessageDeletion) !== 'true' && String(EnableFileDeletion) !== 'true'}
                                    createJobButtonText={
                                        <FormattedMessage
                                            id='admin.data_retention.createJob.title'
                                            defaultMessage='Run Deletion Job Now'
                                        />
                                    }
                                    createJobHelpText={
                                        <div>
                                            <FormattedMessage
                                                id='admin.data_retention.createJob.instructions'
                                                defaultMessage='Daily time to check policies and run delete job:'
                                            />
                                            {this.state.showEditJobTime ?
                                                <ReactSelect
                                                    id={'JobSelectTime'}
                                                    className={'JobSelectTime'}
                                                    components={{
                                                        DropdownIndicator: () => null,
                                                        IndicatorSeparator: () => null,
                                                    }}
                                                    onChange={(e) => {
                                                        this.changeJobTimeConfig((e as {label: string; value: string}).value);
                                                    }}
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            height: 32,
                                                            minHeight: 32,
                                                        }),
                                                        menu: (base) => ({
                                                            ...base,
                                                            width: 210,
                                                        }),
                                                    }}
                                                    onBlur={() => {
                                                        this.showEditJobTime(false);
                                                    }}
                                                    value={{label: this.getJobStartTime(), value: this.props.config.DataRetentionSettings.DeletionJobStartTime}}
                                                    hideSelectedOptions={true}
                                                    isSearchable={true}
                                                    options={this.getJobTimeOptions()}
                                                    ref={this.inputRef}
                                                    onFocus={() => {
                                                        this.showEditJobTime(true);
                                                    }}
                                                    menuIsOpen={this.state.showEditJobTime}
                                                /> :
                                                <span className={'JobSelectedtime'}><b>{this.getJobStartTime()}</b> {'(UTC)'}</span>}
                                            <a onClick={() => this.showEditJobTime(true)}>{'Edit'}</a>
                                        </div>
                                    }
                                />
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}
