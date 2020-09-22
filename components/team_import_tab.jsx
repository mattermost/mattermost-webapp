// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React from 'react';
import PropTypes from 'prop-types';
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';

import * as utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';

import LoadingSpinner from 'components/widgets/loading/loading_spinner';

import BackIcon from 'components/widgets/icons/fa_back_icon';
import SettingUpload from 'components/setting_upload.jsx';
import SuccessIcon from 'components/widgets/icons/fa_success_icon';
import WarningIcon from 'components/widgets/icons/fa_warning_icon';

const holders = defineMessages({
    importSlack: {
        id: t('team_import_tab.importSlack'),
        defaultMessage: 'Import from Slack (Beta)',
    },
});

class TeamImportTab extends React.PureComponent {
    static propTypes = {
        closeModal: PropTypes.func.isRequired,
        collapseModal: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            status: 'ready',
            link: '',
        };
    }

    onImportFailure = () => {
        this.setState({status: 'fail'});
    }

    onImportSuccess = (data) => {
        this.setState({status: 'done', link: 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(atob(data.results))});
    }

    doImportSlack = (file) => {
        this.setState({status: 'in-progress', link: ''});
        utils.importSlack(this.props.team.id, file, this.onImportSuccess, this.onImportFailure);
    }

    render() {
        const uploadDocsLink = (
            <a
                href='https://docs.mattermost.com/administration/migrating.html#migrating-from-slack'
                target='_blank'
                rel='noopener noreferrer'
            >
                <FormattedMessage
                    id='team_import_tab.importHelpDocsLink'
                    defaultMessage='documentation'
                />
            </a>
        );

        const uploadExportInstructions = (
            <strong>
                <FormattedMessage
                    id='team_import_tab.importHelpExportInstructions'
                    defaultMessage='Slack > Administration > Workspace settings > Import/Export Data > Export > Start Export'
                />
            </strong>
        );

        const uploadExporterLink = (
            <a
                href='https://github.com/grundleborg/slack-advanced-exporter'
                target='_blank'
                rel='noopener noreferrer'
            >
                <FormattedMessage
                    id='team_import_tab.importHelpExporterLink'
                    defaultMessage='Slack Advanced Exporter'
                />
            </a>
        );

        const importCliLink = (
            <a
                href='https://docs.mattermost.com/administration/migrating.html#migrating-from-slack-using-the-mattermost-cli'
                target='_blank'
                rel='noopener noreferrer'
            >
                <FormattedMessage
                    id='team_import_tab.importHelpCliDocsLink'
                    defaultMessage='CLI tool for Slack import'
                />
            </a>
        );

        const uploadHelpText = (
            <div>
                <p>
                    <FormattedMessage
                        id='team_import_tab.importHelpLine1'
                        defaultMessage="Slack import to Mattermost supports importing of messages in your Slack team's public channels."
                    />
                </p>
                <p>
                    <FormattedMessage
                        id='team_import_tab.importHelpLine2'
                        defaultMessage='To import a team from Slack, go to {exportInstructions}. See {uploadDocsLink} to learn more.'
                        values={{
                            exportInstructions: uploadExportInstructions,
                            uploadDocsLink,
                        }}
                    />
                </p>
                <p>
                    <FormattedMessage
                        id='team_import_tab.importHelpLine3'
                        defaultMessage='To import posts with attached files, see {slackAdvancedExporterLink} for details.'
                        values={{
                            slackAdvancedExporterLink: uploadExporterLink,
                        }}
                    />
                </p>
                <p>
                    <FormattedMessage
                        id='team_import_tab.importHelpLine4'
                        defaultMessage='For Slack teams with over 10,000 messages, we recommend using the {cliLink}.'
                        values={{
                            cliLink: importCliLink,
                        }}
                    />
                </p>
            </div>
        );

        const uploadSection = (
            <SettingUpload
                title={<FormattedMessage {...holders.importSlack}/>}
                submit={this.doImportSlack}
                helpText={uploadHelpText}
                fileTypesAccepted='.zip'
            />
        );

        let messageSection;
        switch (this.state.status) {
        case 'ready':
            messageSection = '';
            break;
        case 'in-progress':
            messageSection = (
                <p className='confirm-import alert alert-warning'>
                    <LoadingSpinner text={utils.localizeMessage('team_import_tab.importing', 'Importing...')}/>
                </p>
            );
            break;
        case 'done':
            messageSection = (
                <p className='confirm-import alert alert-success'>
                    <SuccessIcon/>
                    <FormattedMessage
                        id='team_import_tab.successful'
                        defaultMessage=' Import successful: '
                    />
                    <a
                        href={this.state.link}
                        download='MattermostImportSummary.txt'
                    >
                        <FormattedMessage
                            id='team_import_tab.summary'
                            defaultMessage='View Summary'
                        />
                    </a>
                </p>
            );
            break;
        case 'fail':
            messageSection = (
                <p className='confirm-import alert alert-warning'>
                    <WarningIcon/>
                    <FormattedMessage
                        id='team_import_tab.failure'
                        defaultMessage=' Import failure: '
                    />
                    <a
                        href={this.state.link}
                        download='MattermostImportSummary.txt'
                    >
                        <FormattedMessage
                            id='team_import_tab.summary'
                            defaultMessage='View Summary'
                        />
                    </a>
                </p>
            );
            break;
        }

        return (
            <div>
                <div className='modal-header'>
                    <button
                        type='button'
                        className='close'
                        data-dismiss='modal'
                        aria-label='Close'
                        onClick={this.props.closeModal}
                    >
                        <span aria-hidden='true'>{'×'}</span>
                    </button>
                    <h4
                        className='modal-title'
                        ref='title'
                    >
                        <div className='modal-back'>
                            <span onClick={this.props.collapseModal}>
                                <BackIcon/>
                            </span>
                        </div>
                        <FormattedMessage
                            id='team_import_tab.import'
                            defaultMessage='Import'
                        />
                    </h4>
                </div>
                <div
                    ref='wrapper'
                    className='user-settings'
                >
                    <h3 className='tab-header'>
                        <FormattedMessage
                            id='team_import_tab.import'
                            defaultMessage='Import'
                        />
                    </h3>
                    <div className='divider-dark first'/>
                    {uploadSection}
                    <div className='divider-dark'/>
                    {messageSection}
                </div>
            </div>
        );
    }
}

TeamImportTab.propTypes = {
    closeModal: PropTypes.func.isRequired,
    collapseModal: PropTypes.func.isRequired,
    team: PropTypes.object.isRequired,
};

export default injectIntl(TeamImportTab);
/* eslint-enable react/no-string-refs */
