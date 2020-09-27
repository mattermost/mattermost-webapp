// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {injectIntl} from 'react-intl';

import ModalStore from 'stores/modal_store.jsx';
import Constants from 'utils/constants';
import {intlShape} from 'utils/react_intl';

import * as Utils from 'utils/utils';

import {allShortcuts} from './shortcuts.ts';

class ShortcutsModal extends React.PureComponent {
    static propTypes = {
        intl: intlShape.isRequired,
        isMac: PropTypes.bool.isRequired,
    };

    constructor(props) {
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

    getShortcuts() {
        const {isMac} = this.props;
        const shortcuts = {};
        Object.keys(allShortcuts).forEach((s) => {
            if (isMac && allShortcuts[s].mac) {
                shortcuts[s] = allShortcuts[s].mac;
            } else if (!isMac && allShortcuts[s].default) {
                shortcuts[s] = allShortcuts[s].default;
            } else {
                shortcuts[s] = allShortcuts[s];
            }
        });

        return shortcuts;
    }

    render() {
        const shortcuts = this.getShortcuts();
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
                                {renderShortcut(
                                    formatMessage(shortcuts.mainHeader),
                                )}
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
                                                {formatMessage(
                                                    shortcuts.navHeader,
                                                )}
                                            </strong>
                                        </h4>
                                        {renderShortcut(
                                            formatMessage(shortcuts.navPrev),
                                        )}
                                        {renderShortcut(
                                            formatMessage(shortcuts.navNext),
                                        )}
                                        {renderShortcut(
                                            formatMessage(
                                                shortcuts.navUnreadPrev,
                                            ),
                                        )}
                                        {renderShortcut(
                                            formatMessage(
                                                shortcuts.navUnreadNext,
                                            ),
                                        )}
                                        {!isLinux &&
                                            renderShortcut(
                                                formatMessage(
                                                    shortcuts.teamNavPrev,
                                                ),
                                            )}
                                        {!isLinux &&
                                            renderShortcut(
                                                formatMessage(
                                                    shortcuts.teamNavNext,
                                                ),
                                            )}
                                        {renderShortcut(
                                            formatMessage(
                                                shortcuts.teamNavSwitcher,
                                            ),
                                        )}
                                        {renderShortcut(
                                            formatMessage(shortcuts.navSwitcher),
                                        )}
                                        {renderShortcut(
                                            formatMessage(shortcuts.navDMMenu),
                                        )}
                                        {renderShortcut(
                                            formatMessage(shortcuts.navSettings),
                                        )}
                                        {renderShortcut(
                                            formatMessage(shortcuts.navMentions),
                                        )}
                                        {renderShortcut(
                                            formatMessage(
                                                shortcuts.navFocusCenter,
                                            ),
                                        )}
                                        {renderShortcut(
                                            formatMessage(
                                                shortcuts.navOpenCloseSidebar,
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className='col-sm-4'>
                                <div className='section'>
                                    <div>
                                        <h4 className='section-title'>
                                            <strong>
                                                {formatMessage(
                                                    shortcuts.msgHeader,
                                                )}
                                            </strong>
                                        </h4>
                                        <span>
                                            <strong>
                                                {formatMessage(
                                                    shortcuts.msgInputHeader,
                                                )}
                                            </strong>
                                        </span>
                                        <div className='subsection'>
                                            {renderShortcut(
                                                formatMessage(shortcuts.msgEdit),
                                            )}
                                            {renderShortcut(
                                                formatMessage(
                                                    shortcuts.msgReply,
                                                ),
                                            )}
                                            {renderShortcut(
                                                formatMessage(
                                                    shortcuts.msgLastReaction,
                                                ),
                                            )}
                                            {renderShortcut(
                                                formatMessage(
                                                    shortcuts.msgReprintPrev,
                                                ),
                                            )}
                                            {renderShortcut(
                                                formatMessage(
                                                    shortcuts.msgReprintNext,
                                                ),
                                            )}
                                        </div>
                                        <span>
                                            <strong>
                                                {formatMessage(
                                                    shortcuts.msgCompHeader,
                                                )}
                                            </strong>
                                        </span>
                                        <div className='subsection'>
                                            {renderShortcut(
                                                formatMessage(
                                                    shortcuts.msgCompUsername,
                                                ),
                                            )}
                                            {renderShortcut(
                                                formatMessage(
                                                    shortcuts.msgCompChannel,
                                                ),
                                            )}
                                            {renderShortcut(
                                                formatMessage(
                                                    shortcuts.msgCompEmoji,
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-sm-4'>
                                <div className='section'>
                                    <div>
                                        <h4 className='section-title'>
                                            <strong>
                                                {formatMessage(
                                                    shortcuts.filesHeader,
                                                )}
                                            </strong>
                                        </h4>
                                        {renderShortcut(
                                            formatMessage(shortcuts.filesUpload),
                                        )}
                                    </div>
                                    <div className='section--lower'>
                                        <h4 className='section-title'>
                                            <strong>
                                                {formatMessage(
                                                    shortcuts.browserHeader,
                                                )}
                                            </strong>
                                        </h4>
                                        {renderShortcut(
                                            formatMessage(
                                                shortcuts.browserChannelPrev,
                                            ),
                                        )}
                                        {renderShortcut(
                                            formatMessage(
                                                shortcuts.browserChannelNext,
                                            ),
                                        )}
                                        {renderShortcut(
                                            formatMessage(
                                                shortcuts.browserFontIncrease,
                                            ),
                                        )}
                                        {renderShortcut(
                                            formatMessage(
                                                shortcuts.browserFontDecrease,
                                            ),
                                        )}
                                        <span>
                                            <strong>
                                                {formatMessage(
                                                    shortcuts.browserInputHeader,
                                                )}
                                            </strong>
                                        </span>
                                        <div className='subsection'>
                                            {renderShortcut(
                                                formatMessage(
                                                    shortcuts.browserHighlightPrev,
                                                ),
                                            )}
                                            {renderShortcut(
                                                formatMessage(
                                                    shortcuts.browserHighlightNext,
                                                ),
                                            )}
                                            {renderShortcut(
                                                formatMessage(
                                                    shortcuts.browserNewline,
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='info__label'>
                            {formatMessage(shortcuts.info)}
                        </div>
                    </Modal.Body>
                </div>
            </Modal>
        );
    }
}

function renderShortcut(text) {
    if (!text) {
        return null;
    }

    const shortcut = text.split('\t');
    const description = <span>{shortcut[0]}</span>;

    let keys = null;
    if (shortcut.length > 1) {
        keys = shortcut[1].split('|').map((key) => (
            <span
                className='shortcut-key'
                key={key}
            >
                {key}
            </span>
        ));
    }

    return (
        <div className='shortcut-line'>
            {description}
            {keys}
        </div>
    );
}

export default injectIntl(ShortcutsModal);
