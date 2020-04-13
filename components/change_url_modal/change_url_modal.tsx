// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import OverlayTrigger from 'components/overlay_trigger';

import Constants from 'utils/constants';
import {getShortenedURL, validateChannelUrl} from 'utils/url';

type Props = {

    /**
     * Set whether to show the modal or not
     */
    show: boolean;

    /**
     * Set to change the title of the modal
     */
    title?: React.ReactNode;

    /**
     * Set to change the submit button text
     */
    submitButtonText?: React.ReactNode;

    /**
     * Set to change the current URL
     */
    currentURL?: string;

    /**
     * Set to the current team URL
     */
    currentTeamURL: string;

    /**
     * Server error from failed channel creation
     */
    serverError?: React.ReactNode;

    /**
     * Function to call when modal is submitted
     */
    onModalSubmit: (newURL: string) => void;

    /**
     * Function to call when modal is exited
     */
    onModalExited?: () => void;

    /**
     * Function to call when modal is dismissed
     */
    onModalDismissed: () => void;
}

type State = {
    currentURL?: string;
    urlErrors: JSX.Element[] | string;
    userEdit: boolean;
};

export default class ChangeURLModal extends React.PureComponent<Props, State> {
    private urlInput: React.RefObject<HTMLInputElement>;

    public static defaultProps = {
        show: false,
        title: 'Change URL',
        submitButtonText: 'Save',
        currentURL: '',
        serverError: null,
    }

    constructor(props: Props) {
        super(props);
        this.urlInput = React.createRef();
        this.state = {
            currentURL: props.currentURL,
            urlErrors: '',
            userEdit: false,
        };
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        // This check prevents the url being deleted when we re-render
        // because of user status check
        if (!state.userEdit) {
            return {currentURL: props.currentURL};
        }

        return null;
    }

    onURLChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value.trim();
        this.setState({currentURL: url.replace(/[^A-Za-z0-9-_]/g, '').toLowerCase(), userEdit: true});
    }

    onSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.preventDefault();
        const url = this.urlInput?.current?.value || '';
        const urlErrors = validateChannelUrl(url);
        if (urlErrors.length > 0) {
            this.setState({urlErrors});
            return;
        }
        this.setState({urlErrors: '', userEdit: false});
        this.props.onModalSubmit(url);
    }

    onCancel = () => {
        this.setState({urlErrors: '', userEdit: false});
        this.props.onModalDismissed();
    }

    render() {
        let urlClass = 'input-group input-group--limit';
        let error = null;

        if (this.state.urlErrors) {
            urlClass += ' has-error';
        }

        if (this.props.serverError || this.state.urlErrors) {
            error = (
                <div className='has-error'>
                    <p className='input__help error'>
                        {this.state.urlErrors || this.props.serverError}
                    </p>
                </div>
            );
        }

        const fullURL = this.props.currentTeamURL + '/channels';
        const shortURL = getShortenedURL(fullURL);
        const urlTooltip = (
            <Tooltip id='urlTooltip'>{fullURL}</Tooltip>
        );

        return (
            <Modal
                dialogClassName='a11y__modal'
                show={this.props.show}
                onHide={this.onCancel}
                onExited={this.props.onModalExited}
                role='dialog'
                aria-labelledby='changeUrlModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='changeUrlModalLabel'
                    >
                        {this.props.title}
                    </Modal.Title>
                </Modal.Header>
                <form
                    role='form'
                    className='form-horizontal'
                >
                    <Modal.Body>
                        <div className='modal-intro'>
                            <FormattedMessage
                                id='channel_flow.changeUrlDescription'
                                defaultMessage='Some characters are now allowed in URLs and may be removed.'
                            />
                        </div>
                        <div className='form-group'>
                            <label className='col-sm-3 form__label control-label'>
                                <FormattedMessage
                                    id='change_url.urlLabel'
                                    defaultMessage='Channel URL'
                                />
                            </label>
                            <div className='col-sm-9'>
                                <div className={urlClass}>
                                    <OverlayTrigger
                                        delayShow={Constants.OVERLAY_TIME_DELAY}
                                        placement='top'
                                        overlay={urlTooltip}
                                    >
                                        <span className='input-group-addon'>{shortURL}</span>
                                    </OverlayTrigger>
                                    <input
                                        type='text'
                                        ref={this.urlInput}
                                        className='form-control'
                                        maxLength={Constants.MAX_CHANNELNAME_LENGTH}
                                        onChange={this.onURLChanged}
                                        value={this.state.currentURL}
                                        autoFocus={true}
                                    />
                                </div>
                                {error}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            type='button'
                            className='btn btn-link'
                            onClick={this.onCancel}
                        >
                            <FormattedMessage
                                id='change_url.close'
                                defaultMessage='Close'
                            />
                        </button>
                        <button
                            onClick={this.onSubmit}
                            type='submit'
                            className='btn btn-primary'
                        >
                            {this.props.submitButtonText}
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }
}
