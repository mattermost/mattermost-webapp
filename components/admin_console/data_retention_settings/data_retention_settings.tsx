// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {JobTypes} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';
import Card from 'components/card/card';
import TitleAndButtonCardHeader from 'components/card/title_and_button_card_header/title_and_button_card_header';

import AdminSettings, {BaseProps, BaseState} from 'components/admin_console/admin_settings';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import DropdownSetting from 'components/admin_console/dropdown_setting.jsx';
import JobsTable from 'components/admin_console/jobs';
import SettingsGroup from 'components/admin_console/settings_group.jsx';
import TextSetting from 'components/admin_console/text_setting';

type Props = {

};

type State = {
    enableMessageDeletion: boolean;
    enableFileDeletion: boolean;
}

export default class DataRetentionSettings extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            enableMessageDeletion: true,
            enableFileDeletion: true
        }
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
                customClass: 'Table__table-icon'
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
                customClass: 'Table__table-icon'
            },
        ];
    }

    componentDidMount = () => {

    }

    render = () => {

        return (
            <div className='wrapper--fixed DataRetentionSettings'>
                <FormattedAdminHeader
                    id='admin.data_retention.title'
                    defaultMessage='Data Retention Policy'
                />
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
                                    onClick={() => {}}
                                />
                            </Card.Header>
                            <Card.Body>
                                
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
                                />
                            </Card.Header>
                            <Card.Body>
                                <JobsTable
                                    jobType={JobTypes.DATA_RETENTION}
                                    disabled={this.state.enableMessageDeletion !== 'true' && this.state.enableFileDeletion !== 'true'}
                                    createJobButtonText={
                                        <FormattedMessage
                                            id='admin.data_retention.createJob.title'
                                            defaultMessage='Run Deletion Job Now'
                                        />
                                    }
                                    createJobHelpText={
                                        <FormattedMessage
                                            id='admin.data_retention.createJob.help'
                                            defaultMessage='Initiates a Data Retention deletion job immediately.'
                                        />
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
