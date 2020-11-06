// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {injectIntl, defineMessages, IntlShape} from 'react-intl';

import ModalStore from 'stores/modal_store';
import Constants from 'utils/constants';

import * as Utils from 'utils/utils';

import {t} from 'utils/i18n';

import {shortcuts} from '../shortcuts';

import ShortcutSequence from '../shortcut_sequence';

import './shortcuts_modal.scss';

const modalMessages = defineMessages({
    msgHeader: {
        id: t('shortcuts.msgs.header'),
        defaultMessage: 'Messages',
    },
    msgInputHeader: {
        id: t('shortcuts.msgs.input.header'),
        defaultMessage: 'Works inside an empty input field',
    },
    filesHeader: {
        id: t('shortcuts.files.header'),
        defaultMessage: 'Files',
    },
    browserHeader: {
        id: t('shortcuts.browser.header'),
        defaultMessage: 'Built-in Browser Commands',
    },
    info: {
        id: t('shortcuts.info'),
        defaultMessage:
      'Begin a message with / for a list of all the commands at your disposal.',
    },
    navHeader: {
        id: t('shortcuts.nav.header'),
        defaultMessage: 'Navigation',
    },
});

type Props = {
    intl: IntlShape;
}

type State = {
    show: boolean;
}

class ShortcutsModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            show: false,
        };
    }

    componentDidMount() {
        ModalStore.addModalListener(
            Constants.ActionTypes.TOGGLE_SHORTCUTS_MODAL,
            this.handleToggle,
        );
    }

    componentWillUnmount() {
        ModalStore.removeModalListener(
            Constants.ActionTypes.TOGGLE_SHORTCUTS_MODAL,
            this.handleToggle,
        );
    }

    handleToggle = () => {
        //toggles the state of shortcut dialog
        this.setState({
            show: !this.state.show,
        });
    };

    handleHide = () => {
        this.setState({show: false});
    };

    render() {
        const {formatMessage} = this.props.intl;

        const isLinux = Utils.isLinux();

        return (
            <Modal
                dialogClassName='a11y__modal shortcuts-modal'
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleHide}
                role='dialog'
                aria-labelledby='shortcutsModalLabel'
            >
                <div className='shortcuts-content'>
                    <Modal.Header closeButton={true}>
                        <Modal.Title
                            componentClass='h1'
                            id='shortcutsModalLabel'
                        >
                            <strong>
                                <ShortcutSequence shortcut={shortcuts.mainHeader}/>
                            </strong>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className='row'>
                            <div className='col-sm-4'>
                                <div className='section'>
                                    <div>
                                        <h4 className='section-title'>
                                            <strong>
                                                {formatMessage({
                                                    id: t('shortcuts.nav.header'),
                                                    defaultMessage: 'Navigation',
                                                })}
                                            </strong>
                                        </h4>
                                        <ShortcutSequence shortcut={shortcuts.navPrev}/>
                                        <ShortcutSequence shortcut={shortcuts.navNext}/>
                                        <ShortcutSequence shortcut={shortcuts.navUnreadPrev}/>
                                        <ShortcutSequence shortcut={shortcuts.navUnreadNext}/>
                                        {!isLinux && (
                                            <>
                                                <ShortcutSequence shortcut={shortcuts.teamNavPrev}/>
                                                <ShortcutSequence shortcut={shortcuts.teamNavNext}/>
                                            </>
                                        )}
                                        <ShortcutSequence shortcut={shortcuts.teamNavSwitcher}/>
                                        <ShortcutSequence shortcut={shortcuts.navSwitcher}/>
                                        <ShortcutSequence shortcut={shortcuts.navDMMenu}/>
                                        <ShortcutSequence shortcut={shortcuts.navSettings}/>

                                        <ShortcutSequence shortcut={shortcuts.navMentions}/>
                                        <ShortcutSequence shortcut={shortcuts.navFocusCenter}/>
                                        <ShortcutSequence shortcut={shortcuts.navOpenCloseSidebar}/>
                                    </div>
                                </div>
                            </div>
                            <div className='col-sm-4'>
                                <div className='section'>
                                    <div>
                                        <h4 className='section-title'>
                                            <strong>
                                                {formatMessage(modalMessages.msgHeader)}
                                            </strong>
                                        </h4>
                                        <span>
                                            <strong>
                                                {formatMessage(modalMessages.msgInputHeader)}
                                            </strong>
                                        </span>
                                        <div className='subsection'>
                                            <ShortcutSequence shortcut={shortcuts.msgEdit}/>
                                            <ShortcutSequence shortcut={shortcuts.msgReply}/>
                                            <ShortcutSequence shortcut={shortcuts.msgLastReaction}/>
                                            <ShortcutSequence shortcut={shortcuts.msgReprintPrev}/>
                                            <ShortcutSequence shortcut={shortcuts.msgReprintNext}/>
                                        </div>
                                        <span>
                                            <strong>
                                                <ShortcutSequence shortcut={shortcuts.msgCompHeader}/>
                                            </strong>
                                        </span>
                                        <div className='subsection'>
                                            <ShortcutSequence shortcut={shortcuts.msgCompUsername}/>
                                            <ShortcutSequence shortcut={shortcuts.msgCompChannel}/>
                                            <ShortcutSequence shortcut={shortcuts.msgCompEmoji}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-sm-4'>
                                <div className='section'>
                                    <div>
                                        <h4 className='section-title'>
                                            <strong>
                                                {formatMessage(modalMessages.filesHeader)}
                                            </strong>
                                        </h4>
                                        <ShortcutSequence shortcut={shortcuts.filesUpload}/>
                                    </div>
                                    <div className='section--lower'>
                                        <h4 className='section-title'>
                                            <strong>
                                                {formatMessage(modalMessages.browserHeader)}
                                            </strong>
                                        </h4>
                                        <ShortcutSequence shortcut={shortcuts.browserChannelPrev}/>
                                        <ShortcutSequence shortcut={shortcuts.browserChannelNext}/>
                                        <ShortcutSequence shortcut={shortcuts.browserFontIncrease}/>
                                        <ShortcutSequence shortcut={shortcuts.browserFontDecrease}/>
                                        <span>
                                            <strong>
                                                <ShortcutSequence shortcut={shortcuts.browserInputHeader}/>
                                            </strong>
                                        </span>
                                        <div className='subsection'>
                                            <ShortcutSequence shortcut={shortcuts.browserHighlightPrev}/>
                                            <ShortcutSequence shortcut={shortcuts.browserHighlightNext}/>
                                            <ShortcutSequence shortcut={shortcuts.browserNewline}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='info__label'>
                            {formatMessage(modalMessages.info)}
                        </div>
                    </Modal.Body>
                </div>
            </Modal>
        );
    }
}
export default injectIntl(ShortcutsModal);
