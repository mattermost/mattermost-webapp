// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {
    checkDialogElementForError, checkIfErrorsMatchElements,
} from 'mattermost-redux/utils/integration_utils';
import {AppCallResponse, AppField, AppForm, AppFormValue, AppFormValues, AppSelectOption, AppCall} from 'mattermost-redux/types/apps';
import {DialogElement} from 'mattermost-redux/types/integrations';
import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import SpinnerButton from 'components/spinner_button';
import SuggestionList from 'components/suggestion/suggestion_list';
import ModalSuggestionList from 'components/suggestion/modal_suggestion_list';

import EmojiMap from 'utils/emoji_map';
import {localizeMessage} from 'utils/utils.jsx';

import AppsFormField from './apps_form_field';
import AppsFormHeader from './apps_form_header';

export type Props = {
    call: AppCall;
    form: AppForm;
    isEmbedded?: boolean;
    onHide: () => void;
    actions: {
        submit: (submission: {
            values: {
                [name: string]: string;
            };
        }) => Promise<{data: AppCallResponse<FormResponseData>}>;
        performLookupCall: (field: AppField, values: AppFormValues, userInput: string) => Promise<AppSelectOption[]>;
        refreshOnSelect: (field: AppField, values: AppFormValues, value: AppFormValue) => Promise<{data: AppCallResponse<any>}>;
    };
    emojiMap: EmojiMap;
}

type FormResponseData = {
    errors: {
        [field: string]: string;
    };
}

type State = {
    show: boolean;
    values: {[name: string]: string};
    error: string | null;
    errors: {[name: string]: React.ReactNode};
    submitting: boolean;
    form: AppForm;
}

const initFormValues = (form: AppForm): {[name: string]: string} => {
    const values: {[name: string]: any} = {};
    if (form && form.fields) {
        form.fields.forEach((f) => {
            values[f.name] = f.value || null;
        });
    }

    return values;
};

export default class AppsForm extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        const {form} = props;
        const values = initFormValues(form);

        this.state = {
            show: true,
            values,
            error: null,
            errors: {},
            submitting: false,
            form,
        };
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        if (nextProps.form !== prevState.form) {
            return {
                values: initFormValues(nextProps.form),
                form: nextProps.form,
            };
        }

        return null;
    }

    handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const {fields} = this.props.form;
        const values = this.state.values;
        const errors: {[name: string]: React.ReactNode} = {};
        if (fields) {
            fields.forEach((field) => {
                const element = {
                    name: field.name,
                    type: field.type,
                    subtype: field.subtype,
                    optional: !field.is_required,
                } as DialogElement;
                const error = checkDialogElementForError( // TODO: make sure all required values are present in `element`
                    element,
                    values[field.name],
                );
                if (error) {
                    errors[field.name] = (
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

        const submission = {
            values,
        };

        this.setState({submitting: true});

        const {data} = await this.props.actions.submit(submission);

        this.setState({submitting: false});

        if (data?.type === 'form' && data.form) {
            this.setState({values: initFormValues(data.form)});
            return;
        }

        let hasErrors = false;

        if (data && data.type === AppCallResponseTypes.ERROR) {
            if (data.error) {
                hasErrors = true;
                this.setState({error: data.error});
            }

            const newErrors = data.data?.errors;

            const elements = fields.map((field) => ({name: field.name})) as DialogElement[];
            if (
                newErrors &&
                Object.keys(newErrors).length >= 0 &&
                checkIfErrorsMatchElements(newErrors as any, elements) // TODO fix types on redux
            ) {
                hasErrors = true;
                this.setState({errors: newErrors});
            }
        }

        if (!hasErrors) {
            this.handleHide(true);
        }
    };

    performLookup = async (name: string, userInput: string): Promise<AppSelectOption[]> => {
        const field = this.props.form.fields.find((f) => f.name === name);
        if (!field) {
            return [];
        }

        return this.props.actions.performLookupCall(field, this.state.values, userInput);
    }

    onHide = () => {
        this.handleHide(false);
    };

    handleHide = (submitted = false) => {
        const {form} = this.props;

        if (!submitted && form.submit_on_cancel) {
            // const dialog = {
            //     url,
            //     callback_id: callbackId,
            //     state,
            //     cancelled: true,
            // };

            // this.props.actions.submit(dialog);
        }

        this.setState({show: false});
    };

    onChange = (name: string, value: any) => {
        const field = this.props.form.fields.find((f) => f.name === name);
        if (!field) {
            return;
        }

        const values = {...this.state.values, [name]: value};

        if (field.refresh) {
            this.props.actions.refreshOnSelect(field, values, value);
        }

        this.setState({values});
    };

    renderModal() {
        const {fields, header} = this.props.form;

        return (
            <Modal
                id='appsModal'
                dialogClassName='a11y__modal about-modal'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
                backdrop='static'
                role='dialog'
                aria-labelledby='appsModalLabel'
            >
                <form onSubmit={this.handleSubmit}>
                    <Modal.Header
                        closeButton={true}
                        style={{borderBottom: fields && fields.length ? '' : '0px'}}
                    >
                        <Modal.Title
                            componentClass='h1'
                            id='appsModalLabel'
                        >
                            {this.renderHeader()}
                        </Modal.Title>
                    </Modal.Header>
                    {(fields || header) && (
                        <Modal.Body>
                            {this.renderBody()}
                        </Modal.Body>
                    )}
                    <Modal.Footer>
                        {this.renderFooter()}
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }

    renderEmbedded() {
        const {fields, header} = this.props.form;

        return (
            <form onSubmit={this.handleSubmit}>
                <div>
                    {this.renderHeader()}
                </div>
                {(fields || header) && (
                    <div>
                        {this.renderBody()}
                    </div>
                )}
                <div>
                    {this.renderFooter()}
                </div>
            </form>
        );
    }

    renderHeader() {
        const {
            title,
            icon,
        } = this.props.form;

        let iconComponent;
        if (icon) {
            iconComponent = (
                <img
                    id='appsModalIconUrl'
                    alt={'modal title icon'}
                    className='more-modal__image'
                    width='36'
                    height='36'
                    src={icon}
                />
            );
        }

        return (
            <React.Fragment>
                {iconComponent}
                {title}
            </React.Fragment>
        );
    }

    renderElements() {
        const {isEmbedded, form} = this.props;

        const {fields} = form;
        if (!fields) {
            return null;
        }

        return fields.map((field, index) => {
            const isSubmit = field.name === form.submit_buttons;

            return (
                <AppsFormField
                    field={field}
                    isSubmit={isSubmit}
                    key={field.name}
                    autoFocus={index === 0}
                    name={field.name}
                    errorText={this.state.errors[field.name]}
                    value={this.state.values[field.name]}
                    performLookup={this.performLookup}
                    onChange={this.onChange}
                    listComponent={isEmbedded ? SuggestionList : ModalSuggestionList}
                />
            );
        });
    }

    renderBody() {
        const {fields, header} = this.props.form;

        return (fields || header) && (
            <React.Fragment>
                {header && (
                    <AppsFormHeader
                        id='appsModalHeader'
                        value={header}
                        emojiMap={this.props.emojiMap}
                    />
                )}
                {this.renderElements()}
            </React.Fragment>
        );
    }

    renderFooter() {
        const {fields} = this.props.form;

        const submitText: React.ReactNode = (
            <FormattedMessage
                id='interactive_dialog.submit'
                defaultMessage='Submit'
            />
        );

        return (
            <React.Fragment>
                {this.state.error && (
                    <div className='error-text'>{this.state.error}</div>
                )}
                <button
                    id='appsModalCancel'
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
                    id='appsModalSubmit'
                    type='submit'
                    autoFocus={!fields || fields.length === 0}
                    className='btn btn-primary save-button'
                    spinning={this.state.submitting}
                    spinningText={localizeMessage(
                        'interactive_dialog.submitting',
                        'Submitting...',
                    )}
                >
                    {submitText}
                </SpinnerButton>
            </React.Fragment>
        );
    }

    render() {
        return this.props.isEmbedded ? this.renderEmbedded() : this.renderModal();
    }
}
