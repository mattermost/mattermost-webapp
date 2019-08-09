// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';
import {AsyncComponent} from 'components/async_load';
import loadSettingsSidebar from 'bundle-loader?lazy!components/settings_sidebar.jsx';

import TeamSettings from 'components/team_settings';

export default class TeamSettingsModal extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        onHide: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            activeTab: 'general',
            activeSection: '',
        };
    }

    componentDidMount() {
        if (!Utils.isMobile()) {
            $('.settings-modal .settings-content').perfectScrollbar();
        }
    }

    updateTab = (tab) => {
        this.setState({
            activeTab: tab,
            activeSection: '',
        });

        if (!Utils.isMobile()) {
            $('.settings-modal .modal-body').scrollTop(0).perfectScrollbar('update');
        }
    }

    updateSection = (section) => {
        if ($('.section-max').length) {
            $('.settings-modal .modal-body').scrollTop(0).perfectScrollbar('update');
        }

        this.setState({activeSection: section});
    }

    closeModal = () => {
        this.props.onHide();
    }

    collapseModal = () => {
        $(ReactDOM.findDOMNode(this.refs.modalBody)).closest('.modal-dialog').removeClass('display--content');

        this.setState({
            active_tab: '',
            active_section: '',
        });
    }

    handleHide = () => {
        this.props.onHide();
    }

    // called after the dialog is fully hidden and faded out
    handleHidden = () => {
        this.setState({
            activeTab: 'general',
            activeSection: '',
        });
    }

    render() {
        const tabs = [];
        tabs.push({name: 'general', uiName: Utils.localizeMessage('team_settings_modal.generalTab', 'General'), icon: 'icon fa fa-cog', iconTitle: Utils.localizeMessage('generic_icons.settings', 'Settings Icon')});
        tabs.push({name: 'import', uiName: Utils.localizeMessage('team_settings_modal.importTab', 'Import'), icon: 'icon fa fa-upload', iconTitle: Utils.localizeMessage('generic_icons.upload', 'Upload Icon')});

        return (
            <Modal
                dialogClassName='a11y__modal settings-modal settings-modal--action'
                show={this.props.show}
                onHide={this.handleHide}
                onExited={this.handleHidden}
                role='dialog'
                aria-labelledby='teamSettingsModalLabel'
            >
                <Modal.Header
                    id='teamSettingsModalLabel'
                    closeButton={true}
                >
                    <Modal.Title componentClass='h1'>
                        <FormattedMessage
                            id='team_settings_modal.title'
                            defaultMessage='Team Settings'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body ref='modalBody'>
                    <div className='settings-table'>
                        <div className='settings-links'>
                            <AsyncComponent
                                doLoad={loadSettingsSidebar}
                                tabs={tabs}
                                activeTab={this.state.activeTab}
                                updateTab={this.updateTab}
                            />
                        </div>
                        <div className='settings-content minimize-settings'>
                            <TeamSettings
                                activeTab={this.state.activeTab}
                                activeSection={this.state.activeSection}
                                updateSection={this.updateSection}
                                closeModal={this.closeModal}
                                collapseModal={this.collapseModal}
                            />
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
