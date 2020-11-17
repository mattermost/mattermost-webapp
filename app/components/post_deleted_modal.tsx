// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

type Props = {
    show: boolean;
    onHide: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default class PostDeletedModal extends React.Component<Props> {
    public shouldComponentUpdate(nextProps: Props): boolean {
        return nextProps.show !== this.props.show;
    }

    public render(): JSX.Element {
        return (
            <Modal
                dialogClassName='a11y__modal'
                show={this.props.show}
                onHide={this.props.onHide}
                role='dialog'
                aria-labelledby='postDeletedModalLabel'
                data-testid='postDeletedModal'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='postDeletedModalLabel'
                    >
                        <FormattedMessage
                            id='post_delete.notPosted'
                            defaultMessage='Comment could not be posted'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        <FormattedMessage
                            id='post_delete.someone'
                            defaultMessage='Someone deleted the message on which you tried to post a comment.'
                        />
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-primary'
                        autoFocus={true}
                        onClick={this.props.onHide}
                        data-testid='postDeletedModalOkButton'
                    >
                        <FormattedMessage
                            id='post_delete.okay'
                            defaultMessage='Okay'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
