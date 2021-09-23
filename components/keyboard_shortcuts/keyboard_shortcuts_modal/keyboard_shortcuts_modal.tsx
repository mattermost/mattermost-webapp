// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {defineMessages, useIntl} from 'react-intl';

import ModalStore from 'stores/modal_store.jsx';
import Constants from 'utils/constants';
import {t} from 'utils/i18n';
import * as Utils from 'utils/utils';
import KeyboardShortcutSequence, {
    KEYBOARD_SHORTCUTS,
} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';
import './keyboard_shortcuts_modal.scss';

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
    msgCompHeader: {
        id: t('shortcuts.msgs.comp.header'),
        defaultMessage: 'Autocomplete',
    },
    browserInputHeader: {
        id: t('shortcuts.browser.input.header'),
        defaultMessage: 'Works inside an input field',
    },
    msgMarkdownHeader: {
        id: t('shortcuts.msgs.markdown.header'),
        defaultMessage: 'Formatting',
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

const KeyboardShortcutsModal = (): JSX.Element => {
    const [show, setShow] = useState<boolean>(false);

    useEffect(() => {
        //toggles the state of shortcut dialog
        const handleToggle = (): void => setShow(!show);
        ModalStore.addModalListener(Constants.ActionTypes.TOGGLE_SHORTCUTS_MODAL, handleToggle);
        return () => {
            ModalStore.removeModalListener(Constants.ActionTypes.TOGGLE_SHORTCUTS_MODAL, handleToggle);
        };
    }, []);

    const handleHide = (): void => setShow(false);
    const {formatMessage} = useIntl();
    const isLinux = Utils.isLinux();

    return (
        <Modal
            dialogClassName='a11y__modal shortcuts-modal'
            show={show}
            onHide={handleHide}
            onExited={handleHide}
            role='dialog'
            aria-labelledby='shortcutsModalLabel'
        >
            <div className='shortcuts-content'>
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='shortcutsModalLabel'
                    >
                        <strong><KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.mainHeader}/></strong>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='row'>
                        <div className='col-sm-4'>
                            <div className='section'>
                                <div>
                                    <h3 className='section-title'><strong>{formatMessage(modalMessages.navHeader)}</strong></h3>
                                    <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navPrev}/>
                                    <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navNext}/>
                                    <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navUnreadPrev}/>
                                    <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navUnreadNext}/>
                                    {!isLinux && <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.teamNavPrev}/>}
                                    {!isLinux && <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.teamNavNext}/>}
                                    <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.teamNavSwitcher}/>
                                    <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navSwitcher}/>
                                    <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navDMMenu}/>
                                    <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navSettings}/>
                                    <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navMentions}/>
                                    <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navFocusCenter}/>
                                    <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navOpenCloseSidebar}/>
                                </div>
                            </div>
                        </div>
                        <div className='col-sm-4'>
                            <div className='section'>
                                <div>
                                    <h3 className='section-title'><strong>{formatMessage(modalMessages.msgHeader)}</strong></h3>
                                    <span><strong>{formatMessage(modalMessages.msgInputHeader)}</strong></span>
                                    <div className='subsection'>
                                        <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgEdit}/>
                                        <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgReply}/>
                                        <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgLastReaction}/>
                                        <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgReprintPrev}/>
                                        <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgReprintNext}/>
                                    </div>
                                    <span><strong>{formatMessage(modalMessages.msgCompHeader)}</strong></span>
                                    <div className='subsection'>
                                        <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgCompUsername}/>
                                        <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgCompChannel}/>
                                        <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgCompEmoji}/>
                                    </div>
                                    <span><strong>{formatMessage(modalMessages.msgMarkdownHeader)}</strong></span>
                                    <div className='subsection'>
                                        <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgMarkdownBold}/>
                                        <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgMarkdownItalic}/>
                                        <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgMarkdownLink}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='col-sm-4'>
                            <div className='section'>
                                <div>
                                    <h3 className='section-title'><strong>{formatMessage(modalMessages.filesHeader)}</strong></h3>
                                    <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.filesUpload}/>
                                </div>
                                <div className='section--lower'>
                                    <h3 className='section-title'><strong>{formatMessage(modalMessages.browserHeader)}</strong></h3>
                                    <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.browserChannelPrev}/>
                                    <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.browserChannelNext}/>
                                    <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.browserFontIncrease}/>
                                    <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.browserFontDecrease}/>
                                    <span><strong>{formatMessage(modalMessages.browserInputHeader)}</strong></span>
                                    <div className='subsection'>
                                        <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.browserHighlightPrev}/>
                                        <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.browserHighlightNext}/>
                                        <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.browserNewline}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='info__label'>{formatMessage(modalMessages.info)}</div>
                </Modal.Body>
            </div>
        </Modal>
    );
};

export default KeyboardShortcutsModal;
