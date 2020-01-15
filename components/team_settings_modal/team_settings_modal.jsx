// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';
const SettingsSidebar = React.lazy(() => import('components/settings_sidebar.tsx'));

import TeamSettings from 'components/team_settings';

export default class TeamSettingsModal extends React.Component {
    static propTypes = {
        onHide: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            activeTab: 'general',
            activeSection: '',
            show: true,
        };

        this.modalBodyRef = React.createRef();
    }

    updateTab = (tab) => {
        this.setState({
            activeTab: tab,
            activeSection: '',
        });
    }

    updateSection = (section) => {
        this.setState({activeSection: section});
    }

    collapseModal = () => {
        $(ReactDOM.findDOMNode(this.modalBodyRef.current)).closest('.modal-dialog').removeClass('display--content');

        this.setState({
            active_tab: '',
            active_section: '',
        });
    }

    handleHide = () => {
        this.setState({show: false});
    }

    // called after the dialog is fully hidden and faded out
    handleHidden = () => {
        this.setState({
            activeTab: 'general',
            activeSection: '',
        });
        this.props.onHide();
    }

    render() {
        const tabs = [];
        tabs.push({name: 'general', uiName: Utils.localizeMessage('team_settings_modal.generalTab', 'General'), icon: 'icon fa fa-cog', iconTitle: Utils.localizeMessage('generic_icons.settings', 'Settings Icon')});
        tabs.push({name: 'import', uiName: Utils.localizeMessage('team_settings_modal.importTab', 'Import'), icon: 'icon fa fa-upload', iconTitle: Utils.localizeMessage('generic_icons.upload', 'Upload Icon')});

        return (
            <Modal
                dialogClassName='a11y__modal settings-modal settings-modal--action'
                show={this.state.show}
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
                <Modal.Body ref={this.modalBodyRef}>
                    <div className='settings-table'>
                        <div className='settings-links'>
                            <React.Suspense fallback={null}>
                                <SettingsSidebar
                                    tabs={tabs}
                                    activeTab={this.state.activeTab}
                                    updateTab={this.updateTab}
                                />
                            </React.Suspense>
                        </div>
                        <div className='settings-content minimize-settings'>
                            <TeamSettings
                                activeTab={this.state.activeTab}
                                activeSection={this.state.activeSection}
                                updateSection={this.updateSection}
                                closeModal={this.handleHide}
                                collapseModal={this.collapseModal}
                            />
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
