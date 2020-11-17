// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';
const SettingsSidebar = React.lazy(() => import('components/settings_sidebar'));

import TeamSettings from 'components/team_settings';

type Props = {
    onHide: () => void,
    isCloud?: boolean,
}

export type State = {
    activeTab: string,
    activeSection: string,
    show: boolean,
}

export default class TeamSettingsModal extends React.PureComponent<Props, State> {
    modalBodyRef: React.RefObject<Modal>;

    constructor(props:Props) {
        super(props);

        this.state = {
            activeTab: 'general',
            activeSection: '',
            show: true,
        };

        this.modalBodyRef = React.createRef();
    }

    updateTab = (tab: string) => {
        this.setState({
            activeTab: tab,
            activeSection: '',
        });
    }

    updateSection = (section:string) => {
        this.setState({activeSection: section});
    }

    collapseModal = () => {
        const el = ReactDOM.findDOMNode(this.modalBodyRef.current) as HTMLDivElement;
        $(el).closest('.modal-dialog').removeClass('display--content'); // eslint-disable-line jquery/no-closest, jquery/no-class

        this.setState({
            activeTab: '',
            activeSection: '',
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
        if (!this.props.isCloud) {
            tabs.push({name: 'import', uiName: Utils.localizeMessage('team_settings_modal.importTab', 'Import'), icon: 'icon fa fa-upload', iconTitle: Utils.localizeMessage('generic_icons.upload', 'Upload Icon')});
        }

        return (
            <Modal
                dialogClassName='a11y__modal settings-modal settings-modal--action'
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleHidden}
                role='dialog'
                aria-labelledby='teamSettingsModalLabel'
                id='teamSettingsModal'
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
