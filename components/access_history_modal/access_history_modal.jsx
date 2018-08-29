// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {isMobile} from 'utils/utils.jsx';
import AuditTable from 'components/audit_table.jsx';
import LoadingScreen from 'components/loading_screen.jsx';

export default class AccessHistoryModal extends React.PureComponent {
    static propTypes = {

        /**
         * Function that's called when modal is closed
         */
        onHide: PropTypes.func.isRequired,
        actions: PropTypes.shape({

            /**
             * Function to fetch the user's audits
             */
            getUserAudits: PropTypes.func.isRequired,
        }).isRequired,

        /**
         * The current user's audits
         */
        userAudits: PropTypes.array.isRequired,

        /**
         * The current user id
         */
        currentUserId: PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            show: true,
        };
    }

    onShow = () => {
        this.props.actions.getUserAudits(this.props.currentUserId, 0, 200);
        if (!isMobile()) {
            $('.modal-body').perfectScrollbar();
        }
    }

    onHide = () => {
        this.setState({show: false});
    }

    componentDidMount() {
        this.onShow();
    }

    render() {
        let content;
        if (this.props.userAudits.length === 0) {
            content = (<LoadingScreen/>);
        } else {
            content = (
                <AuditTable
                    audits={this.props.userAudits}
                    showIp={true}
                    showSession={true}
                />
            );
        }

        return (
            <Modal
                dialogClassName='modal--scroll'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
                bsSize='large'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='access_history.title'
                            defaultMessage='Access History'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body ref='modalBody'>
                    {content}
                </Modal.Body>
            </Modal>
        );
    }
}
