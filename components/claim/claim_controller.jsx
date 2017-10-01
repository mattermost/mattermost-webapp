// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import logoImage from 'images/logo.png';

import BackButton from 'components/common/back_button.jsx';

export default class ClaimController extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }
    componentWillMount() {
        this.setState({
            email: this.props.location.query.email,
            newType: this.props.location.query.new_type,
            oldType: this.props.location.query.old_type
        });
    }
    render() {
        return (
            <div>
                <BackButton/>
                <div className='col-sm-12'>
                    <div className='signup-team__container'>
                        <img
                            className='signup-team-logo'
                            src={logoImage}
                        />
                        <div id='claim'>
                            {React.cloneElement(this.props.children, {
                                currentType: this.state.oldType,
                                newType: this.state.newType,
                                email: this.state.email
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ClaimController.defaultProps = {
};
ClaimController.propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.node
};
