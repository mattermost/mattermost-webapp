// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import Markdown from 'components/markdown';

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
        /* eslint-disable no-console */

        let schemaText = this.props.schema ? JSON.stringify(JSON.parse(this.props.schema), null, 2) : '';
        schemaText = `\`\`\`json
${schemaText}
\`\`\``;
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
                    <div className='schema-information__content'>
                        <div>
                            <Markdown message={schemaText}/>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
