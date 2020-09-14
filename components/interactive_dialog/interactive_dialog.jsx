// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {
    checkDialogElementForError,
    checkIfErrorsMatchElements,
} from 'mattermost-redux/utils/integration_utils';

import {Client4} from 'mattermost-redux/client';

import SpinnerButton from 'components/spinner_button';

import {localizeMessage} from 'utils/utils.jsx';

import DialogElement from './dialog_element';
import DialogIntroductionText from './dialog_introduction_text';

export default class InteractiveDialog extends React.PureComponent {
    static propTypes = {
        url: PropTypes.string.isRequired,
        callbackId: PropTypes.string,
        elements: PropTypes.arrayOf(PropTypes.object),
        title: PropTypes.string.isRequired,
        introductionText: PropTypes.string,
        iconUrl: PropTypes.string,
        submitLabel: PropTypes.string,
        notifyOnCancel: PropTypes.bool,
        state: PropTypes.string,
        onHide: PropTypes.func,
        actions: PropTypes.shape({
            submitInteractiveDialog: PropTypes.func.isRequired,
            updateInteractiveDialogElements: PropTypes.func.isRequired,
        }).isRequired,
        emojiMap: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        const values = {};
        if (props.elements != null) {
            props.elements.forEach((e) => {
                if (e.type === 'bool') {
                    values[e.name] =
                        e.default === true ||
                        String(e.default).toLowerCase() === 'true';
                } else {
                    values[e.name] = e.default || null;
                }
            });
        }

        this.state = {
            show: true,
            values,
            error: null,
            errors: {},
            submitting: false,
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.elements !== prevProps.elements) {
            const values = {...this.state.values};
            for (const key of Object.keys(values)) {
                if (!this.props.elements.find((el) => el.name === key)) {
                    delete values[key];
                }
            }
            this.setState({values});
        }
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        const {elements} = this.props;
        const values = this.state.values;
        const errors = {};
        if (elements) {
            elements.forEach((elem) => {
                const error = checkDialogElementForError(
                    elem,
                    values[elem.name],
                );
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
        }

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

        const {data} = await this.props.actions.submitInteractiveDialog(
            dialog,
        );

        this.setState({submitting: false});

        let hasErrors = false;

        if (data) {
            if (data.error) {
                hasErrors = true;
                this.setState({error: data.error});
            }

            if (
                data.errors &&
                Object.keys(data.errors).length >= 0 &&
                checkIfErrorsMatchElements(data.errors, elements)
            ) {
                hasErrors = true;
                this.setState({errors: data.errors});
            }
        }

        if (!hasErrors) {
            this.handleHide(true);
        }
    };

    onHide = () => {
        this.handleHide(false);
    };

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
    };

    getAutocompleteResults = async (name, text) => {
        const element = this.props.elements.find((e) => e.name === name);
        if (!element.data_source) {
            const ls = ['A', 'B', 'C', 'always here'];
            const options = ls.filter((t) => t === 'always here' || t.toLowerCase().includes(text.toLowerCase())).map((t) => ({text: t, value: t}));
            return {items: options};
        }

        const u = element.data_source;
        // const u = 'http://localhost:8065/plugins/proxy';
        const payload = {
            url: element.data_source,
            method: 'POST',
            element,
            text,
            form: this.state.values,
        };

        const res = await fetch(u,
            {
                ...Client4.getOptions({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }),
                credentials: undefined,
            });

        return res.json();
    };

    onChange = (name, value) => {
        const values = {...this.state.values, [name]: value};
        const element = this.props.elements.find((el) => el.name === name);

        if (element.dispatch_on_change) {
            // integration server will figure out next stage
            this.dispatchChange(name, value);
            this.setState({values});
            return;
        }

        // synchronously update elements that depend on this element, if any
        let updateElements = false;
        const elements = this.props.elements.map((el, i) => {
            if (el.depends_on === name && el.type === 'select' && el.subtype === 'dynamic') {
                updateElements = true;
                // setting options to a new array tells child element to recreate its suggestion provider
                return {...el, options: []};
            }
            return el;
        });

        this.setState({values});
        if (updateElements) {
            this.props.actions.updateInteractiveDialogElements(elements);
        }
    };

    dispatchChange = async (name, value) => {
        const {url, callbackId, state, elements} = this.props;
        const {values} = this.state;

        const payload = {
            url,
            callback_id: callbackId,
            state,
            elements,
            values,
            name,
            value,
        };

        const {data} = await this.props.actions.dispatchSelectInteractiveDialog(payload);

        let updateElements = Boolean(data.elements);
        const newElements = (data.elements || elements).map((el, i) => {
            if (el.depends_on === name && el.type === 'select' && el.subtype === 'dynamic') {
                updateElements = true;
                return {...el, options: []};
            }
            return el;
        });

        if (data.values) {
            this.setState({values: data.values});
        }
        if (updateElements) {
            this.props.actions.updateInteractiveDialogElements(newElements);
        }
    }

    render() {
        const {
            title,
            introductionText,
            iconUrl,
            submitLabel,
            elements,
        } = this.props;

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
                    id='interactiveDialogIconUrl'
                    alt={'modal title icon'}
                    className='more-modal__image'
                    width='36'
                    height='36'
                    src={iconUrl}
                />
            );
        }

        return (
            <Modal
                id='interactiveDialogModal'
                dialogClassName='a11y__modal about-modal'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
                backdrop='static'
                role='dialog'
                aria-labelledby='interactiveDialogModalLabel'
            >
                <form onSubmit={this.handleSubmit}>
                    <Modal.Header
                        closeButton={true}
                        style={{borderBottom: elements == null && '0px'}}
                    >
                        <Modal.Title
                            componentClass='h1'
                            id='interactiveDialogModalLabel'
                        >
                            {icon}
                            {title}
                        </Modal.Title>
                    </Modal.Header>
                    {(elements || introductionText) && (
                        <Modal.Body>
                            {introductionText && (
                                <DialogIntroductionText
                                    id='interactiveDialogModalIntroductionText'
                                    value={introductionText}
                                    emojiMap={this.props.emojiMap}
                                />
                            )}
                            {elements && elements.map((e, index) => {
                                return (
                                    <DialogElement
                                        autoFocus={index === 0}
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
                                        fetchOnce={e.fetch_once}
                                        value={this.state.values[e.name]}
                                        onChange={this.onChange}
                                        getAutocompleteResults={this.getAutocompleteResults}
                                    />
                                );
                            })}
                        </Modal.Body>
                    )}
                    <Modal.Footer>
                        {this.state.error && (
                            <div className='error-text'>{this.state.error}</div>
                        )}
                        <button
                            id='interactiveDialogCancel'
                            type='button'
                            className='btn btn-link cancel-button'
                            onClick={this.onHide}
                        >
                            <FormattedMessage
                                id='interactive_dialog.cancel'
                                defaultMessage='Cancel'
                            />
                        </button>
                        <SpinnerButton
                            id='interactiveDialogSubmit'
                            type='submit'
                            autoFocus={!elements || elements.length === 0}
                            className='btn btn-primary save-button'
                            spinning={this.state.submitting}
                            spinningText={localizeMessage(
                                'interactive_dialog.submitting',
                                'Submitting...',
                            )}
                        >
                            {submitText}
                        </SpinnerButton>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }
}
