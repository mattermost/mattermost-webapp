// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

export default class PermalinkRedirector extends React.PureComponent {
    static propTypes = {
        postId: PropTypes.string,
        url: PropTypes.string,
        actions: PropTypes.shape({
            redirect: PropTypes.func.isRequired,
        }).isRequired,
    };

    componentDidMount() {
        if (this.props.postId) {
            this.props.actions.redirect(`pl/${this.props.postId}`);
        } else if (this.props.url === '/_redirect/integrations') {
            this.props.actions.redirect('integrations');
        }
    }

    render() {
        return null;
    }
}
