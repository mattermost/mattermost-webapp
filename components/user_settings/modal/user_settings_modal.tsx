// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {RefObject} from 'react';
import {Modal} from 'react-bootstrap';
import {Provider} from 'react-redux';

import ReactDOM from 'react-dom';
import {
    defineMessages,
    FormattedMessage,
    injectIntl,
    IntlShape,
} from 'react-intl';

import {UserProfile} from 'mattermost-redux/types/users';
import {StatusOK} from 'mattermost-redux/types/client4';

import store from 'stores/redux_store.jsx';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';
import ConfirmModal from '../../confirm_modal';

const UserSettings = React.lazy(() => import(/* webpackPrefetch: true */ 'components/user_settings'));
const SettingsSidebar = React.lazy(() => import(/* webpackPrefetch: true */ '../../settings_sidebar'));

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

export type Props = {
    currentUser: UserProfile;
    onHide: () => void;
    onExit: () => void;
    intl: IntlShape;
    actions: {
        sendVerificationEmail: (email: string) => Promise<{
            data: StatusOK;
            error: {
                err: string;
            };
        }>;
    };
}

type State = {
    active_tab?: string;
    active_section: string;
    showConfirmModal: boolean;
    enforceFocus?: boolean;
    show: boolean;
    resendStatus: string;
}

class UserSettingsModal extends React.PureComponent<Props, State> {
    private requireConfirm: boolean;
    private customConfirmAction: ((handleConfirm: () => void) => void) | null;
    private modalBodyRef: React.RefObject<Modal>;
    private afterConfirm: (() => void) | null;

    static defaultProps = {
        onExit: () => {},
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            active_tab: 'general',
            active_section: '',
            showConfirmModal: false,
            enforceFocus: true,
            show: true,
            resendStatus: '',
        };

        this.requireConfirm = false;

        // Used when settings want to override the default confirm modal with their own
        // If set by a child, it will be called in place of showing the regular confirm
        // modal. It will be passed a function to call on modal confirm
        this.customConfirmAction = null;
        this.afterConfirm = null;

        this.modalBodyRef = React.createRef();
    }

    handleResend = (email: string) => {
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

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.state.active_tab !== prevState.active_tab) {
            const el = ReactDOM.findDOMNode(this.modalBodyRef.current) as any;
            el.scrollTop = 0;
        }
    }

    handleKeyDown = (e: KeyboardEvent) => {
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
        });
        this.props.onHide();
        this.props.onExit();
    }

    // Called to hide the settings pane when on mobile
    handleCollapse = () => {
        const el = ReactDOM.findDOMNode(this.modalBodyRef.current) as HTMLDivElement;
        el.closest('.modal-dialog')!.classList.remove('display--content');

        this.setState({
            active_tab: '',
            active_section: '',
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

    showConfirmModal = (afterConfirm: () => void) => {
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

    updateTab = (tab?: string, skipConfirm?: boolean) => {
        if (!skipConfirm && this.requireConfirm) {
            this.showConfirmModal(() => this.updateTab(tab, true));
        } else {
            this.setState({
                active_tab: tab,
                active_section: '',
            });
        }
    }

    updateSection = (section?: string, skipConfirm?: boolean) => {
        if (!skipConfirm && this.requireConfirm) {
            this.showConfirmModal(() => this.updateSection(section, true));
        } else {
            this.setState({
                active_section: section!,
            });
        }
    }

    render() {
        const {formatMessage} = this.props.intl;
        if (this.props.currentUser == null) {
            return (<div/>);
        }
        const tabs = [];

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
                            <React.Suspense fallback={null}>
                                <Provider store={store}>
                                    <SettingsSidebar
                                        tabs={tabs}
                                        activeTab={this.state.active_tab}
                                        updateTab={this.updateTab}
                                    />
                                </Provider>
                            </React.Suspense>
                        </div>
                        <div className='settings-content minimize-settings'>
                            <React.Suspense fallback={null}>
                                <Provider store={store}>
                                    <UserSettings
                                        activeTab={this.state.active_tab}
                                        activeSection={this.state.active_section}
                                        updateSection={this.updateSection}
                                        updateTab={this.updateTab}
                                        closeModal={this.closeModal}
                                        collapseModal={this.collapseModal}
                                        setEnforceFocus={(enforceFocus?: boolean) => this.setState({enforceFocus})}
                                        setRequireConfirm={
                                            (requireConfirm?: boolean, customConfirmAction?: () => () => void) => {
                                                this.requireConfirm = requireConfirm!;
                                                this.customConfirmAction = customConfirmAction!;
                                            }
                                        }
                                    />
                                </Provider>
                            </React.Suspense>
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
