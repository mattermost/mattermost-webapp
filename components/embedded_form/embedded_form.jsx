// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {
    checkDialogElementForError,
    checkIfErrorsMatchElements,
} from 'mattermost-redux/utils/integration_utils';

import SpinnerButton from 'components/spinner_button';
import SuggestionList from 'components/suggestion/suggestion_list';

import {localizeMessage} from 'utils/utils.jsx';

import DialogElement from '../interactive_dialog/dialog_element';
import DialogIntroductionText from '../interactive_dialog/dialog_introduction_text';

export default class EmbeddedForm extends React.PureComponent {
    static propTypes = {
        url: PropTypes.string.isRequired,
        callbackId: PropTypes.string,
        elements: PropTypes.arrayOf(PropTypes.object),
        title: PropTypes.string.isRequired,
        introductionText: PropTypes.string,
        iconUrl: PropTypes.string,
        submitLabel: PropTypes.string,
        state: PropTypes.string,
        actions: PropTypes.shape({
            submitEmbeddedForm: PropTypes.func.isRequired,
        }).isRequired,
        emojiMap: PropTypes.object.isRequired,
        postID: PropTypes.string.isRequired,
        appID: PropTypes.string.isRequired,
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
            values,
            error: null,
            errors: {},
            submitting: false,
        };
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

        const {data} = await this.props.actions.submitEmbeddedForm(
            dialog,
            this.props.postID,
            this.props.appID,
        );

        this.setState({submitting: false});

        //let hasErrors = false;

        if (data) {
            if (data.error) {
                //hasErrors = true;
                this.setState({error: data.error});
            }

            if (
                data.errors &&
                Object.keys(data.errors).length >= 0 &&
                checkIfErrorsMatchElements(data.errors, elements)
            ) {
                //hasErrors = true;
                this.setState({errors: data.errors});
            }
        }

        // TODO handle non error data to update the form?
    };

    onChange = (name, value) => {
        const values = {...this.state.values, [name]: value};
        this.setState({values});
    };

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
            <form onSubmit={this.handleSubmit}>
                <div>
                    {icon}
                    {title}
                </div>
                {(elements || introductionText) && (
                    <div>
                        {introductionText && (
                            <DialogIntroductionText
                                id='interactiveDialogModalIntroductionText'
                                value={introductionText}
                                emojiMap={this.props.emojiMap}
                            />
                        )}
                        {elements &&
                        elements.map((e, index) => {
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
                                    value={this.state.values[e.name]}
                                    onChange={this.onChange}
                                    listComponent={SuggestionList}
                                />
                            );
                        })}
                    </div>
                )}
                <div>
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
                </div>
            </form>
        );
    }
}
