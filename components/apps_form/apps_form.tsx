// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';

import {
    checkDialogElementForError, checkIfErrorsMatchElements,
} from 'mattermost-redux/utils/integration_utils';
import {AppCallResponse, AppField, AppForm, AppFormValues, AppSelectOption, AppCall} from 'mattermost-redux/types/apps';
import {DialogElement} from 'mattermost-redux/types/integrations';
import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import SpinnerButton from 'components/spinner_button';
import SuggestionList from 'components/suggestion/suggestion_list';
import ModalSuggestionList from 'components/suggestion/modal_suggestion_list';

import {localizeMessage} from 'utils/utils.jsx';

import AppsFormField from './apps_form_field';
import AppsFormHeader from './apps_form_header';

export type AppsFormProps = {
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
        refreshOnSelect: (field: AppField, values: AppFormValues) => Promise<{data: AppCallResponse<any>}>;
    };
}

type Props = AppsFormProps & WrappedComponentProps<'intl'>;

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

export class AppsForm extends React.PureComponent<Props, State> {
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

    handleSubmit = async (e: React.FormEvent, submitName?: string, value?: string) => {
        e.preventDefault();

        const {fields} = this.props.form;
        const values = this.state.values;
        if (submitName && value) {
            values[submitName] = value;
        }

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

        const res = await this.props.actions.submit(submission);
        const callResp = res.data as AppCallResponse<FormResponseData>;

        let hasErrors = false;
        let updatedForm = false;
        switch (callResp.type) {
        case AppCallResponseTypes.ERROR: {
            if (callResp.error) {
                hasErrors = true;
                this.setState({error: callResp.error});
            }

            const newErrors = callResp.data?.errors;

            const elements = fields.map((field) => ({name: field.name})) as DialogElement[];
            if (
                newErrors &&
                Object.keys(newErrors).length >= 0 &&
                checkIfErrorsMatchElements(newErrors as any, elements) // TODO fix types on redux
            ) {
                hasErrors = true;
                this.setState({errors: newErrors});
            }
            break;
        }
        case AppCallResponseTypes.FORM:
            updatedForm = true;
            break;
        case AppCallResponseTypes.OK:
        case AppCallResponseTypes.NAVIGATE:
            break;
        default:
            hasErrors = true;
            this.setState({error: this.props.intl.formatMessage(
                {id: 'apps.error.responses.unknown_type', defaultMessage: 'App response type not supported. Response type: {type}.'},
                {type: callResp.type},
            )});
        }

        if (!hasErrors && !updatedForm) {
            this.handleHide(true);
            return;
        }

        this.setState({submitting: false});
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
            this.props.actions.refreshOnSelect(field, values);
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
                <form onSubmit={(e: React.FormEvent) => this.handleSubmit(e)}>
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

        return fields.filter((f) => f.name !== form.submit_buttons).map((field, index) => {
            return (
                <AppsFormField
                    field={field}
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

        let submitButtons = [(
            <SpinnerButton
                id='appsModalSubmit'
                key='submit'
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
        )];

        if (this.props.form.submit_buttons) {
            const field = fields?.find((f) => f.name === this.props.form.submit_buttons);
            if (field) {
                const buttons = field.options?.map((o) => (
                    <SpinnerButton
                        id={'appsModalSubmit' + o.value}
                        key={o.value}
                        type='submit'
                        className='btn btn-primary save-button'
                        spinningText={localizeMessage(
                            'interactive_dialog.submitting',
                            'Submitting...',
                        )}
                        onClick={(e: React.MouseEvent) => this.handleSubmit(e, field.name, o.value)}
                    >
                        {o.label}
                    </SpinnerButton>
                ));
                if (buttons) {
                    submitButtons = buttons;
                }
            }
        }

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
                {submitButtons}
            </React.Fragment>
        );
    }

    render() {
        return this.props.isEmbedded ? this.renderEmbedded() : this.renderModal();
    }
}

export default injectIntl(AppsForm);
