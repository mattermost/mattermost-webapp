// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import MemberListTeam from 'components/member_list_team';

export default class TeamMembersModal extends React.PureComponent {
    static propTypes = {

        /**
         * Current team object
         */
        currentTeam: PropTypes.object.isRequired,

        /**
         * Function called when modal is dismissed
         */
        onHide: PropTypes.func.isRequired,

        /**
         * Function called when modal is loaded
         */
        onLoad: PropTypes.func,
    }

    constructor(props) {
        super(props);
        this.state = {
            show: true,
        };
    }

    componentDidMount() {
        if (this.props.onLoad) {
            this.props.onLoad();
        }
    }

    onHide = () => {
        this.setState({show: false});
    }

    render() {
        let teamDisplayName = '';
        if (this.props.currentTeam) {
            teamDisplayName = this.props.currentTeam.display_name;
        }

        return (
            <Modal
                dialogClassName='more-modal'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='team_member_modal.members'
                            defaultMessage='{team} Members'
                            values={{
                                team: teamDisplayName,
                            }}
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <MemberListTeam
                        teamId={this.props.currentTeam.id}
                    />
                </Modal.Body>
            </Modal>
        );
    }
}
