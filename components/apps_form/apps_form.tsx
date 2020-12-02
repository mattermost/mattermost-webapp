// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {
    checkDialogElementForError, checkIfErrorsMatchElements,
} from 'mattermost-redux/utils/integration_utils';
import {AppCallResponse, AppField, AppForm, AppSelectOption, AppCall} from 'mattermost-redux/types/apps';
import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import SpinnerButton from 'components/spinner_button';
import SuggestionList from 'components/suggestion/suggestion_list';
import ModalSuggestionList from 'components/suggestion/modal_suggestion_list';

import EmojiMap from 'utils/emoji_map';
import {localizeMessage} from 'utils/utils.jsx';

import AppsFormField from './apps_form_field';
import AppsFormHeader from './apps_form_header';
import {FormValues, FormValue} from './apps_form_field/apps_form_select_field';

export type Props = {
    call: AppCall;
    form: AppForm;
    isEmbedded?: boolean;
    title: string;
    introductionText?: string;
    iconUrl?: string;
    submitLabel?: string;
    notifyOnCancel?: boolean;
    state?: string;
    onHide: () => void;
    actions: {
        submit: (dialog: {
            values: {
                [name: string]: string;
            };
        }) => Promise<{data: AppCallResponse<FormResponseData>}>;
        performLookupCall: (field: AppField, values: FormValues, userInput: string) => Promise<AppSelectOption[]>;
        refreshOnSelect: (field: AppField, values: FormValues, value: FormValue) => Promise<{data: AppCallResponse<any>}>;
    };
    emojiMap: EmojiMap;
}

type FormResponseData = {
    errors: {
        [field: string]: string
    }
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
                const error = checkDialogElementForError(
                    field,
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

        const dialog = {
            values,
        };

        this.setState({submitting: true});

        const {data} = await this.props.actions.submit(dialog);

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

            const elements = fields.map((field) => ({name: field.name}));
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
        if (!field || !field.source_url) {
            return [];
        }

        return this.props.actions.performLookupCall(field, this.state.values, userInput);
    }

    onHide = () => {
        this.handleHide(false);
    };

    handleHide = (submitted = false) => {
        const {notifyOnCancel} = this.props;

        if (!submitted && notifyOnCancel) {
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

        if (field.refresh_url) {
            this.props.actions.refreshOnSelect(field, this.state.values, value);
        }

        this.setState((state) => {
            const values = {...state.values, [name]: value};
            return {values};
        });
    };

    renderModal() {
        const {
            introductionText,
        } = this.props;

        const {fields} = this.props.form;

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
                        style={{borderBottom: fields && fields.length ? '' : '0px'}}
                    >
                        <Modal.Title
                            componentClass='h1'
                            id='interactiveDialogModalLabel'
                        >
                            {this.renderHeader()}
                        </Modal.Title>
                    </Modal.Header>
                    {(fields || introductionText) && (
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
        const {
            introductionText,
        } = this.props;

        const {fields} = this.props.form;

        return (
            <form onSubmit={this.handleSubmit}>
                <div>
                    {this.renderHeader()}
                </div>
                {(fields || introductionText) && (
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
            iconUrl,
        } = this.props;

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
            <React.Fragment>
                {icon}
                {title}
            </React.Fragment>
        );
    }

    renderElements() {
        const {isEmbedded} = this.props;

        const {fields} = this.props.form;

        return (fields &&
        fields.map((field, index) => {
            return (
                <AppsFormField
                    field={field}
                    performLookup={this.performLookup}
                    key={field.name}
                    autoFocus={index === 0}
                    name={field.name}
                    errorText={this.state.errors[field.name]}
                    value={this.state.values[field.name]}
                    onChange={this.onChange}
                    listComponent={isEmbedded ? SuggestionList : ModalSuggestionList}
                />
            );
        }));
    }

    renderBody() {
        const {
            introductionText,
        } = this.props;

        const {fields} = this.props.form;

        return (fields || introductionText) && (
            <React.Fragment>
                {introductionText && (
                    <AppsFormHeader
                        id='interactiveDialogModalIntroductionText'
                        value={introductionText}
                        emojiMap={this.props.emojiMap}
                    />
                )}
                {this.renderElements()}
            </React.Fragment>
        );
    }

    renderFooter() {
        const {
            submitLabel,
        } = this.props;

        const {fields} = this.props.form;

        let submitText: React.ReactNode = (
            <FormattedMessage
                id='interactive_dialog.submit'
                defaultMessage='Submit'
            />
        );
        if (submitLabel) {
            submitText = submitLabel;
        }

        return (
            <React.Fragment>
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
