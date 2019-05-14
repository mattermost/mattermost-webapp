// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const ButtonDefault = styled.button`
    background-color: transparent !important;
    border: solid 1px #165DBA !important;
    color: #165DBA;
    :hover, :active, :focus, :active:focus {
	    color: #165DBA;
    }
    margin-right: 8px;
`;

export default class AdminButtonDefault extends React.Component {
    static propTypes = {
        onClick: PropTypes.func.isRequired,
        className: PropTypes.string,
        children: PropTypes.element.isRequired,
    }
    render() {
        return (
            <ButtonDefault
                onClick={this.props.onClick}
                className={`btn btn-primary ${this.props.className}`}
            >
                {this.props.children}
            </ButtonDefault>
        );
    }
}