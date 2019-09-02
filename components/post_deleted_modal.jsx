// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

export default class PostDeletedModal extends React.Component {
    static propTypes = {

        /**
         * Determines whether this modal should be shown or not
         */
        show: PropTypes.bool.isRequired,

        /**
         * Function that is called when modal is hidden
         */
        onHide: PropTypes.func.isRequired,
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.show !== this.props.show;
    }

    render() {
        return (
            <Modal
                dialogClassName='a11y__modal'
                show={this.props.show}
                onHide={this.props.onHide}
                role='dialog'
                aria-labelledby='postDeletedModalLabel'
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
