// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import {Modal} from 'react-bootstrap';
import ReactDOM from 'react-dom';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';
import ConfirmModal from '../../confirm_modal.jsx';
import {AsyncComponent} from 'components/async_load';

import loadUserSettings from 'bundle-loader?lazy!components/user_settings';
import loadSettingsSidebar from 'bundle-loader?lazy!../../settings_sidebar.jsx';

const holders = defineMessages({
    general: {
        id: t('user.settings.modal.general'),
        defaultMessage: 'General',
    },
    security: {
        id: t('user.settings.modal.security'),
        defaultMessage: 'Security',
    },
    notifications: {
        id: t('user.settings.modal.notifications'),
        defaultMessage: 'Notifications',
    },
    display: {
        id: t('user.settings.modal.display'),
        defaultMessage: 'Display',
    },
    sidebar: {
        id: t('user.settings.modal.sidebar'),
        defaultMessage: 'Sidebar',
    },
    advanced: {
        id: t('user.settings.modal.advanced'),
        defaultMessage: 'Advanced',
    },
    checkEmail: {
        id: 'user.settings.general.checkEmail',
        defaultMessage: 'Check your email at {email} to verify the address. Cannot find the email?',
    },
    confirmTitle: {
        id: t('user.settings.modal.confirmTitle'),
        defaultMessage: 'Discard Changes?',
    },
    confirmMsg: {
        id: t('user.settings.modal.confirmMsg'),
        defaultMessage: 'You have unsaved changes, are you sure you want to discard them?',
    },
    confirmBtns: {
        id: t('user.settings.modal.confirmBtns'),
        defaultMessage: 'Yes, Discard',
    },
});

class UserSettingsModal extends React.Component {
    static propTypes = {
        currentUser: PropTypes.object.isRequired,
        onHide: PropTypes.func.isRequired,
        intl: intlShape.isRequired,
        actions: PropTypes.shape({
            sendVerificationEmail: PropTypes.func.isRequred,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            active_tab: 'general',
            active_section: '',
            prev_active_section: 'dummySectionName', // dummy value that should never match any section name
            showConfirmModal: false,
            enforceFocus: true,
            show: true,
        };

        this.requireConfirm = false;

        // Used when settings want to override the default confirm modal with their own
        // If set by a child, it will be called in place of showing the regular confirm
        // modal. It will be passed a function to call on modal confirm
        this.customConfirmAction = null;

        this.modalBodyRef = React.createRef();
    }

    handleResend = (email) => {
        this.setState({resendStatus: 'sending'});

        this.props.actions.sendVerificationEmail(email).then(({data, error: err}) => {
            if (data) {
                this.setState({resendStatus: 'success'});
            } else if (err) {
                this.setState({resendStatus: 'failure'});
            }
        });
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    componentDidUpdate(prevProps, prevState) {
        if (!Utils.isMobile()) {
            $('.settings-content .minimize-settings').perfectScrollbar('update');
        }

        if (this.state.active_tab !== prevState.active_tab) {
            $(ReactDOM.findDOMNode(this.modalBodyRef.current)).scrollTop(0);
        }
    }

    handleKeyDown = (e) => {
        if (Utils.cmdOrCtrlPressed(e) && e.shiftKey && Utils.isKeyPressed(e, Constants.KeyCodes.A)) {
            this.handleHide();
        }
    }

    // Called when the close button is pressed on the main modal
    handleHide = () => {
        if (this.requireConfirm) {
            this.showConfirmModal(() => this.handleHide());
            return;
        }

        this.setState({
            show: false,
        });
    }

    // called after the dialog is fully hidden and faded out
    handleHidden = () => {
        this.setState({
            active_tab: 'general',
            active_section: '',
            prev_active_section: 'dummySectionName',
        });
        this.props.onHide();
    }

    // Called to hide the settings pane when on mobile
    handleCollapse = () => {
        $(ReactDOM.findDOMNode(this.modalBodyRef.current)).closest('.modal-dialog').removeClass('display--content');

        this.setState({
            active_tab: '',
            active_section: '',
            prev_active_section: '',
        });
    }

    handleConfirm = () => {
        this.setState({
            showConfirmModal: false,
            enforceFocus: true,
        });

        this.requireConfirm = false;
        this.customConfirmAction = null;

        if (this.afterConfirm) {
            this.afterConfirm();
            this.afterConfirm = null;
        }
    }

    handleCancelConfirmation = () => {
        this.setState({
            showConfirmModal: false,
            enforceFocus: true,
        });

        this.afterConfirm = null;
    }

    showConfirmModal = (afterConfirm) => {
        if (afterConfirm) {
            this.afterConfirm = afterConfirm;
        }

        if (this.customConfirmAction) {
            this.customConfirmAction(this.handleConfirm);
            return;
        }

        this.setState({
            showConfirmModal: true,
            enforceFocus: false,
        });
    }

    // Called by settings tabs when their close button is pressed
    closeModal = () => {
        if (this.requireConfirm) {
            this.showConfirmModal(this.closeModal);
        } else {
            this.handleHide();
        }
    }

    // Called by settings tabs when their back button is pressed
    collapseModal = () => {
        if (this.requireConfirm) {
            this.showConfirmModal(this.collapseModal);
        } else {
            this.handleCollapse();
        }
    }

    updateTab = (tab, skipConfirm) => {
        if (!skipConfirm && this.requireConfirm) {
            this.showConfirmModal(() => this.updateTab(tab, true));
        } else {
            this.setState({
                active_tab: tab,
                active_section: '',
                prev_active_section: 'dummySectionName',
            });
        }
    }

    updateSection = (section, skipConfirm) => {
        if (!skipConfirm && this.requireConfirm) {
            this.showConfirmModal(() => this.updateSection(section, true));
        } else {
            this.setState({
                prev_active_section: section ? '' : this.state.active_section,
                active_section: section,
            });
        }
    }

    render() {
        const {formatMessage} = this.props.intl;
        if (this.props.currentUser == null) {
            return (<div/>);
        }
        var tabs = [];

        tabs.push({name: 'general', uiName: formatMessage(holders.general), icon: 'icon fa fa-gear', iconTitle: Utils.localizeMessage('user.settings.general.icon', 'General Settings Icon')});
        tabs.push({name: 'security', uiName: formatMessage(holders.security), icon: 'icon fa fa-lock', iconTitle: Utils.localizeMessage('user.settings.security.icon', 'Security Settings Icon')});
        tabs.push({name: 'notifications', uiName: formatMessage(holders.notifications), icon: 'icon fa fa-exclamation-circle', iconTitle: Utils.localizeMessage('user.settings.notifications.icon', 'Notification Settings Icon')});
        tabs.push({name: 'display', uiName: formatMessage(holders.display), icon: 'icon fa fa-eye', iconTitle: Utils.localizeMessage('user.settings.display.icon', 'Display Settings Icon')});
        tabs.push({name: 'sidebar', uiName: formatMessage(holders.sidebar), icon: 'icon fa fa-columns', iconTitle: Utils.localizeMessage('user.settings.sidebar.icon', 'Sidebar Settings Icon')});
        tabs.push({name: 'advanced', uiName: formatMessage(holders.advanced), icon: 'icon fa fa-list-alt', iconTitle: Utils.localizeMessage('user.settings.advance.icon', 'Advanced Settings Icon')});

        return (
            <Modal
                id='accountSettingsModal'
                dialogClassName='a11y__modal settings-modal'
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleHidden}
                enforceFocus={this.state.enforceFocus}
                role='dialog'
                aria-labelledby='accountSettingsModalLabel'
            >
                <Modal.Header
                    id='accountSettingsHeader'
                    closeButton={true}
                >
                    <Modal.Title
                        componentClass='h1'
                        id='accountSettingsModalLabel'
                    >
                        <FormattedMessage
                            id='user.settings.modal.title'
                            defaultMessage='Account Settings'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body ref={this.modalBodyRef}>
                    <div className='settings-table'>
                        <div className='settings-links'>
                            <AsyncComponent
                                doLoad={loadSettingsSidebar}
                                tabs={tabs}
                                activeTab={this.state.active_tab}
                                updateTab={this.updateTab}
                            />
                        </div>
                        <div className='settings-content minimize-settings'>
                            <AsyncComponent
                                doLoad={loadUserSettings}
                                activeTab={this.state.active_tab}
                                activeSection={this.state.active_section}
                                prevActiveSection={this.state.prev_active_section}
                                updateSection={this.updateSection}
                                updateTab={this.updateTab}
                                closeModal={this.closeModal}
                                collapseModal={this.collapseModal}
                                setEnforceFocus={(enforceFocus) => this.setState({enforceFocus})}
                                setRequireConfirm={
                                    (requireConfirm, customConfirmAction) => {
                                        this.requireConfirm = requireConfirm;
                                        this.customConfirmAction = customConfirmAction;
                                    }
                                }
                            />
                        </div>
                    </div>
                </Modal.Body>
                <ConfirmModal
                    title={formatMessage(holders.confirmTitle)}
                    message={formatMessage(holders.confirmMsg)}
                    confirmButtonText={formatMessage(holders.confirmBtns)}
                    show={this.state.showConfirmModal}
                    onConfirm={this.handleConfirm}
                    onCancel={this.handleCancelConfirmation}
                />
            </Modal>
        );
    }
}

export default injectIntl(UserSettingsModal);
