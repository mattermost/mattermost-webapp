// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

export default class PermalinkRedirector extends React.PureComponent {
    static propTypes = {
        params: PropTypes.object,
        url: PropTypes.string,
        actions: PropTypes.shape({
            redirect: PropTypes.func.isRequired,
        }).isRequired,
    };

    componentDidMount() {
        this.props.actions.redirect(this.props.url, this.props.params);
    }

    render() {
        return null;
    }
}
