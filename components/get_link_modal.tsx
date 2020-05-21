// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import LoadingWrapper from 'components/widgets/loading/loading_wrapper';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import SuccessIcon from 'components/widgets/icons/fa_success_icon';

type Props = {
    show: boolean;
    onHide: () => void;
    title: string;
    helpText?: string;
    link: string;
}

type State = {
    copiedLink: boolean;
    buttonOpacity: number;
}

export default class GetLinkModal extends React.PureComponent<Props, State> {
    private textAreaRef = React.createRef<HTMLTextAreaElement>();
    public static defaultProps = {
        helpText: null,
    };

    public constructor(props: Props) {
        super(props);
        this.state = {
            copiedLink: false,
        };
    }

    public onHide = (): void => {
        this.setState({copiedLink: false});
        this.props.onHide();
    }

    public copyLink = (): void => {
        const textarea = this.textAreaRef.current;

        if (textarea && this.props.link) {
            textarea.focus();
            textarea.setSelectionRange(0, this.props.link.length);

            try {
                this.setState({copiedLink: document.execCommand('copy')});
            } catch (err) {
                this.setState({copiedLink: false});
            }
        }
    }

    public render(): JSX.Element {
        let helpText = null;
        if (this.props.helpText) {
            helpText = (
                <p>
                    {this.props.helpText}
                    <br/>
                    <br/>
                </p>
            );
        }

        let copyLink = null;
        const linkAvailable = Boolean(this.props.link);
        const buttonTextOpacity = linkAvailable ? 1 : 0;
        const buttonSpinOpacity = linkAvailable ? 0 : 1;
        const spinnerVisible = linkAvailable ? 'hidden' : 'visible';

        if (document.queryCommandSupported('copy')) {
            copyLink = (
                <button
                    id='linkModalCopyLink'
                    data-copy-btn='true'
                    type='button'
                    className='btn btn-primary pull-left'
                    disabled={!linkAvailable}
                    onClick={this.copyLink}
                >
                    <span style={{position: 'relative'}} >
                        <span style={{opacity: buttonTextOpacity}} >
                            <FormattedMessage
                                id='get_link.copy'
                                defaultMessage='Copy Link'
                            />
                        </span>
                        <span
                            style={{
                                visibility: spinnerVisible,
                                left: 0,
                                top: 0,
                                marginLeft: '50%',
                                opacity: buttonSpinOpacity,
                                position: 'absolute',
                                transform: 'translate3d(-50%, 0, 0)'
                            }}
                        >
                            <LoadingSpinner/>
                        </span>
                    </span>
                </button>
            );
        }

        const linkText = (
            <textarea
                id='linkModalTextArea'
                className='form-control no-resize min-height'
                ref={this.textAreaRef}
                value={this.props.link}
                onClick={this.copyLink}
                readOnly={true}
            />
        );

        let copyLinkConfirm = null;
        if (this.state.copiedLink) {
            copyLinkConfirm = (
                <p className='alert alert-success alert--confirm'>
                    <SuccessIcon/>
                    <FormattedMessage
                        id='get_link.clipboard'
                        defaultMessage=' Link copied'
                    />
                </p>
            );
        }

        return (
            <Modal
                dialogClassName='a11y__modal'
                show={this.props.show}
                onHide={this.onHide}
                role='dialog'
                aria-labelledby='getLinkModalLabel'
            >
                <Modal.Header
                    id='getLinkModalLabel'
                    closeButton={true}
                >
                    <h4 className='modal-title'>{this.props.title}</h4>
                </Modal.Header>
                <Modal.Body>
                    {helpText}
                    {linkText}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        id='linkModalCloseButton'
                        type='button'
                        className='btn btn-link'
                        onClick={this.onHide}
                    >
                        <FormattedMessage
                            id='get_link.close'
                            defaultMessage='Close'
                        />
                    </button>
                    {copyLink}
                    {copyLinkConfirm}
                </Modal.Footer>
            </Modal>
        );
    }
}
