// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {Provider} from 'react-redux';
import ReactDOM from 'react-dom';
import {
    FormattedMessage,
    injectIntl,
    IntlShape,
} from 'react-intl';

import {
    BellOutlineIcon,
    CloseIcon, DockLeftIcon,
    ForumOutlineIcon, GlobeIcon,
    MagnifyIcon,
    PaletteOutlineIcon, TuneIcon,
} from '@mattermost/compass-icons/components';

import TextInput from '@mattermost/compass-components/components/text-input/TextInput';

import {UserProfile} from '@mattermost/types/users';
import {StatusOK} from '@mattermost/types/client4';
import store from 'stores/redux_store.jsx';
import Constants from 'utils/constants';
import * as Utils from 'utils/utils';
import ConfirmModal from 'components/confirm_modal';
import {holders} from '../constants';

const UserSettings = React.lazy(() => import(/* webpackPrefetch: true */ 'components/user_settings'));
const ModalSidebar = React.lazy(() => import(/* webpackPrefetch: true */ '../generic/modal_sidebar'));

import './user_settings_modal.scss';
export type Props = {
    currentUser: UserProfile;
    onExited: () => void;
    intl: IntlShape;
    isContentProductSettings: boolean;
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

    constructor(props: Props) {
        super(props);

        this.state = {
            active_tab: props.isContentProductSettings ? 'notifications' : 'profile',
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
            e.preventDefault();
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
            active_tab: this.props.isContentProductSettings ? 'notifications' : 'profile',
            active_section: '',
        });
        this.props.onExited();
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
        if (this.props.isContentProductSettings) {
            tabs.push({name: 'notifications',
                uiName: formatMessage(holders.notifications),
                icon: (
                    <BellOutlineIcon
                        size={18}
                        color={'currentcolor'}
                    />
                ),
            });
            tabs.push({name: 'themes',
                uiName: formatMessage(holders.themes),
                icon: (
                    <PaletteOutlineIcon
                        size={18}
                        color={'currentcolor'}
                    />
                ),
            });
            tabs.push({name: 'messages',
                uiName: formatMessage(holders.messages),
                icon: (
                    <ForumOutlineIcon
                        size={18}
                        color={'currentcolor'}
                    />
                ),
            });
            tabs.push({name: 'language',
                uiName: formatMessage(holders.language),
                icon: (
                    <GlobeIcon
                        size={18}
                        color={'currentcolor'}
                    />
                ),
            });
            tabs.push({name: 'sidebar',
                uiName: formatMessage(holders.sidebar),
                icon: (
                    <DockLeftIcon
                        size={18}
                        color={'currentcolor'}
                    />
                ),
            });
            tabs.push({name: 'advanced',
                uiName: formatMessage(holders.advanced),
                icon: (
                    <TuneIcon
                        size={18}
                        color={'currentcolor'}
                    />
                ),
            });
        } else {
            tabs.push({name: 'profile',
                uiName: formatMessage(holders.profile),
                icon: (
                    <BellOutlineIcon
                        size={18}
                        color={'currentcolor'}
                    />
                ),
            });
            tabs.push({name: 'security',
                uiName: formatMessage(holders.security),
                icon: (
                    <BellOutlineIcon
                        size={18}
                        color={'currentcolor'}
                    />
                )});
        }

        return (
            <Modal
                id='accountSettingsModal'
                dialogClassName='a11y__modal settings-modal user-settings-modal'
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleHidden}
                enforceFocus={this.state.enforceFocus}
                role='dialog'
                aria-labelledby='accountSettingsModalLabel'
            >
                <Modal.Header
                    id='accountSettingsHeader'
                    closeButton={false}
                    className='user-settings-modal__header'
                >
                    <h1
                        id='accountSettingsModalLabel'
                        className='user-settings-modal__heading'
                    >
                        {this.props.isContentProductSettings ? (
                            <FormattedMessage
                                id='global_header.productSettings'
                                defaultMessage='Settings'
                            />
                        ) : (
                            <FormattedMessage
                                id='user.settings.modal.title'
                                defaultMessage='Profile'
                            />
                        )}
                    </h1>
                    <div className='user-settings-modal__search-ctr'>
                        <TextInput
                            className='user-settings-modal__search'
                            leadingIcon={'magnify'}
                            placeholder={'Search preferences'}
                        >
                            {'Search Preferences'}
                        </TextInput>
                        <CloseIcon
                            size={24}
                            color={'currentcolor'}
                        />
                    </div>
                </Modal.Header>
                <Modal.Body ref={this.modalBodyRef}>
                    <div className='user-settings-modal__body'>
                        <div className='user-settings-modal__sidebar'>
                            <React.Suspense fallback={null}>
                                <Provider store={store}>
                                    <ModalSidebar
                                        tabs={tabs}
                                        activeTab={this.state.active_tab}
                                        updateTab={this.updateTab}
                                    />
                                </Provider>
                            </React.Suspense>
                        </div>
                        <div className='user-settings-modal__content'>
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
