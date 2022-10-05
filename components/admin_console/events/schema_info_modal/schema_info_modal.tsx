// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';

type Props = {

    /**
     * Function called after the modal has been hidden
     */
    onExited: () => void;

    /**
     * Webapp build hash override. By default, webpack sets this (so it must be overridden in tests).
     */
    schema?: string;
};

type State = {
    show: boolean;
};

export default class SchemaInformationModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            show: true,
        };
    }

    doHide = () => {
        this.setState({show: false});
    }

    render() {
        return (
            <Modal
                dialogClassName='a11y__modal about-modal'
                show={this.state.show}
                onHide={this.doHide}
                onExited={this.props.onExited}
                role='dialog'
                aria-labelledby='aboutModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='aboutModalLabel'
                    >
                        {'Event Data Schema'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='about-modal__content'>
                        <div>
                            <pre>{this.props.schema}</pre>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
