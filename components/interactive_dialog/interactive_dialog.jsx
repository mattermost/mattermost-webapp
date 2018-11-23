// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {checkDialogElementForError, checkIfErrorsMatchElements} from 'mattermost-redux/utils/integration_utils';

import SpinnerButton from 'components/spinner_button';

import DialogElement from './dialog_element';

export default class InteractiveDialog extends React.Component {
    static propTypes = {
        url: PropTypes.string.isRequired,
        callbackId: PropTypes.string,
        elements: PropTypes.arrayOf(PropTypes.object).isRequired,
        title: PropTypes.string.isRequired,
        iconUrl: PropTypes.string,
        submitLabel: PropTypes.string,
        notifyOnCancel: PropTypes.bool,
        state: PropTypes.string,
        onHide: PropTypes.func,
        actions: PropTypes.shape({
            submitInteractiveDialog: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        const values = {};
        props.elements.forEach((e) => {
            values[e.name] = e.default || null;
        });

        this.state = {
            show: true,
            values,
            errors: {},
            submitting: false,
        };
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        const {elements} = this.props;
        const values = this.state.values;
        const errors = {};
        elements.forEach((elem) => {
            const error = checkDialogElementForError(elem, values[elem.name]);
            if (error) {
                errors[elem.name] = (
                    <FormattedMessage
                        id={error.id}
                        defaultMessage={error.defaultMessage}
                        values={error.values}
                    />
                );
            }
        });

        this.setState({errors});

        if (Object.keys(errors).length !== 0) {
            return;
        }

        const {url, callbackId, state} = this.props;

        const dialog = {
            url,
            callback_id: callbackId,
            state,
            submission: values,
        };

        this.setState({submitting: true});

        const {data} = await this.props.actions.submitInteractiveDialog(dialog);

        this.setState({submitting: false});

        if (!data || !data.errors || Object.keys(data.errors).length === 0) {
            this.handleHide(true);
            return;
        }

        if (checkIfErrorsMatchElements(data.errors, elements)) {
            this.setState({errors: data.errors});
            return;
        }

        this.handleHide(true);
    }

    onHide = () => {
        this.handleHide(false);
    }

    handleHide = (submitted = false) => {
        const {url, callbackId, state, notifyOnCancel} = this.props;

        if (!submitted && notifyOnCancel) {
            const dialog = {
                url,
                callback_id: callbackId,
                state,
                cancelled: true,
            };

            this.props.actions.submitInteractiveDialog(dialog);
        }

        this.setState({show: false});
    }

    onChange = (name, value) => {
        const values = {...this.state.values, [name]: value};
        this.setState({values});
    }

    render() {
        const {title, iconUrl, submitLabel, elements} = this.props;

        let submitText = (
            <FormattedMessage
                id='interactive_dialog.submit'
                defaultMessage='Submit'
            />
        );
        if (submitLabel) {
            submitText = submitLabel;
        }

        let icon;
        if (iconUrl) {
            icon = (
                <img
                    className='more-modal__image'
                    width='36'
                    height='36'
                    src={iconUrl}
                />
            );
        }

        return (
            <Modal
                dialogClassName='about-modal'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
                backdrop='static'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        {icon}{title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {elements.map((e) => {
                        return (
                            <DialogElement
                                key={'dialogelement' + e.name}
                                displayName={e.display_name}
                                name={e.name}
                                type={e.type}
                                subtype={e.subtype}
                                helpText={e.help_text}
                                errorText={this.state.errors[e.name]}
                                placeholder={e.placeholder}
                                minLength={e.min_length}
                                maxLength={e.max_length}
                                dataSource={e.data_source}
                                optional={e.optional}
                                options={e.options}
                                value={this.state.values[e.name]}
                                onChange={this.onChange}
                            />
                        );
                    })}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-default cancel-button'
                        onClick={this.onHide}
                    >
                        <FormattedMessage
                            id='interactive_dialog.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <SpinnerButton
                        type='button'
                        className='btn btn-primary save-button'
                        onClick={this.handleSubmit}
                        spinning={this.state.submitting}
                    >
                        {submitText}
                    </SpinnerButton>
                </Modal.Footer>
            </Modal>
        );
    }
}