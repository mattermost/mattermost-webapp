// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {
    checkDialogElementForError, checkIfErrorsMatchElements,
} from 'mattermost-redux/utils/integration_utils';
import {AppCallResponse, AppField, AppForm, AppModalState} from 'mattermost-redux/types/apps';
import {DialogElement as DialogElementProps} from 'mattermost-redux/types/integrations';
import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import SpinnerButton from 'components/spinner_button';
import SuggestionList from 'components/suggestion/suggestion_list';
import ModalSuggestionList from 'components/suggestion/modal_suggestion_list';

import EmojiMap from 'utils/emoji_map';
import {localizeMessage} from 'utils/utils.jsx';

import DialogElement from './dialog_element';
import DialogIntroductionText from './dialog_introduction_text';

export type Props = {
    modal: AppModalState;
    appID?: string;
    url: string;
    callbackId?: string;
    elements: DialogElementProps[],
    title: string;
    introductionText?: string;
    iconUrl?: string;
    submitLabel?: string;
    notifyOnCancel?: boolean;
    state?: string;
    onHide: () => void,
    actions: {
        submit: (dialog: {
            values: {
                [name: string]: string;
            };
        }) => Promise<{data: AppCallResponse<FormResponseData>}>;
    },
    emojiMap: EmojiMap;
    isEmbedded?: boolean;
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
}

export default class InteractiveDialog extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        const {form} = props.modal;

        const values = this.initFormValues(form);

        this.state = {
            show: true,
            values,
            error: null,
            errors: {},
            submitting: false,
        };
    }

    initFormValues = (form: AppForm): {[name: string]: string} => {
        const values: {[name: string]: any} = {};
        if (form && form.fields) {
            form.fields.forEach((f) => {
                values[f.name] = f.value || null;
            });
        }

        return values;
    }

    handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const {elements} = this.props;
        const values = this.state.values;
        const errors: {[name: string]: React.ReactNode} = {};
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

        const dialog = {
            values,
        };

        this.setState({submitting: true});

        const {data} = await this.props.actions.submit(dialog);

        this.setState({submitting: false});

        if (data?.type === 'form' && data.form) {
            this.setState({values: this.initFormValues(data.form)});
            return;
        }

        let hasErrors = false;

        if (data && data.type === AppCallResponseTypes.ERROR) {
            if (data.error) {
                hasErrors = true;
                this.setState({error: data.error});
            }

            const newErrors = data.data?.errors;

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
        this.setState((state) => {
            const values = {...state.values, [name]: value};
            return {values};
        });
    };

    renderModal() {
        const {
            elements,
            introductionText,
        } = this.props;

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
                        style={{borderBottom: elements && elements.length ? '' : '0px'}}
                    >
                        <Modal.Title
                            componentClass='h1'
                            id='interactiveDialogModalLabel'
                        >
                            {this.renderHeader()}
                        </Modal.Title>
                    </Modal.Header>
                    {(elements || introductionText) && (
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
            elements,
            introductionText,
        } = this.props;

        return (
            <form onSubmit={this.handleSubmit}>
                <div>
                    {this.renderHeader()}
                </div>
                {(elements || introductionText) && (
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
        const {elements, isEmbedded} = this.props;

        return (elements &&
        elements.map((e, index) => {
            const field = this.props.modal.form.fields.find((f) => f.name === e.name) as AppField & {key?: string};
            return (
                <DialogElement
                    field={field}
                    key={field.key || field.name}
                    autoFocus={index === 0}
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
                    listComponent={isEmbedded ? SuggestionList : ModalSuggestionList}
                />
            );
        }));
    }

    renderBody() {
        const {
            introductionText,
            elements,
        } = this.props;

        return (elements || introductionText) && (
            <React.Fragment>
                {introductionText && (
                    <DialogIntroductionText
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
            elements,
            submitLabel,
        } = this.props;

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
            </React.Fragment>
        );
    }

    render() {
        return this.props.isEmbedded ? this.renderEmbedded() : this.renderModal();
    }
}
