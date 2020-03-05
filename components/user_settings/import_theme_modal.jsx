// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {setThemeDefaults} from 'mattermost-redux/utils/theme_utils';

import ModalStore from 'stores/modal_store.jsx';
import Constants from 'utils/constants';

const ActionTypes = Constants.ActionTypes;

export default class ImportThemeModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: '',
            inputError: '',
            show: false,
            callback: null,
        };
    }

    componentDidMount() {
        ModalStore.addModalListener(ActionTypes.TOGGLE_IMPORT_THEME_MODAL, this.updateShow);
    }

    componentWillUnmount() {
        ModalStore.removeModalListener(ActionTypes.TOGGLE_IMPORT_THEME_MODAL, this.updateShow);
    }

    updateShow = (show, args) => {
        this.setState({
            show,
            callback: args.callback,
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();

        const text = this.state.value;

        if (!this.isInputValid(text)) {
            this.setState({
                inputError: (
                    <FormattedMessage
                        id='user.settings.import_theme.submitError'
                        defaultMessage='Invalid format, please try copying and pasting in again.'
                    />
                ),
            });
            return;
        }

        const colors = text.split(',');
        const theme = {type: 'custom'};

        theme.sidebarBg = colors[0];
        theme.sidebarText = colors[5];
        theme.sidebarUnreadText = colors[5];
        theme.sidebarTextHoverBg = colors[4];
        theme.sidebarTextActiveBorder = colors[2];
        theme.sidebarTextActiveColor = colors[3];
        theme.sidebarHeaderBg = colors[1];
        theme.sidebarHeaderTextColor = colors[5];
        theme.onlineIndicator = colors[6];
        theme.mentionBg = colors[7];
        setThemeDefaults(theme);

        this.state.callback(theme);
        this.setState({
            show: false,
            callback: null,
        });
    }

    isInputValid(text) {
        if (text.length === 0) {
            return false;
        }

        if (text.indexOf(' ') !== -1) {
            return false;
        }

        if (text.length > 0 && text.indexOf(',') === -1) {
            return false;
        }

        if (text.length > 0) {
            const colors = text.split(',');

            if (colors.length !== 8) {
                return false;
            }

            for (let i = 0; i < colors.length; i++) {
                if (colors[i].length !== 7 && colors[i].length !== 4) {
                    return false;
                }

                if (colors[i].charAt(0) !== '#') {
                    return false;
                }
            }
        }

        return true;
    }

    handleChange = (e) => {
        const value = e.target.value;
        this.setState({value});

        if (this.isInputValid(value)) {
            this.setState({inputError: null});
        } else {
            this.setState({
                inputError: (
                    <FormattedMessage
                        id='user.settings.import_theme.submitError'
                        defaultMessage='Invalid format, please try copying and pasting in again.'
                    />
                ),
            });
        }
    }

    handleOnHide = () => {
        this.setState({show: false});
    }

    render() {
        return (
            <span>
                <Modal
                    dialogClassName='a11y__modal'
                    show={this.state.show}
                    onHide={this.handleOnHide}
                    role='dialog'
                    aria-labelledby='importThemeModalLabel'
                >
                    <Modal.Header closeButton={true}>
                        <Modal.Title
                            componentClass='h1'
                            id='importThemeModalLabel'
                        >
                            <FormattedMessage
                                id='user.settings.import_theme.importHeader'
                                defaultMessage='Import Slack Theme'
                            />
                        </Modal.Title>
                    </Modal.Header>
                    <form
                        role='form'
                        className='form-horizontal'
                    >
                        <Modal.Body>
                            <p>
                                <FormattedMessage
                                    id='user.settings.import_theme.importBody'
                                    defaultMessage='To import a theme, go to a Slack team and look for "Preferences -> Sidebar Theme". Open the custom theme option, copy the theme color values and paste them here:'
                                />
                            </p>
                            <div className='form-group less'>
                                <div className='col-sm-12'>
                                    <input
                                        id='themeVector'
                                        type='text'
                                        className='form-control'
                                        value={this.state.value}
                                        onChange={this.handleChange}
                                    />
                                    <div className='input__help'>
                                        {this.state.inputError}
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button
                                id='cancelButton'
                                type='button'
                                className='btn btn-link'
                                onClick={this.handleOnHide}
                            >
                                <FormattedMessage
                                    id='user.settings.import_theme.cancel'
                                    defaultMessage='Cancel'
                                />
                            </button>
                            <button
                                id='submitButton'
                                onClick={this.handleSubmit}
                                type='submit'
                                className='btn btn-primary'
                            >
                                <FormattedMessage
                                    id='user.settings.import_theme.submit'
                                    defaultMessage='Submit'
                                />
                            </button>
                        </Modal.Footer>
                    </form>
                </Modal>
            </span>
        );
    }
}
