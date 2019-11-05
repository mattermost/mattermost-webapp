// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import * as Utils from 'utils/utils.jsx';
import GetLinkModal from 'components/get_link_modal';

export default class GetPublicLinkModal extends React.PureComponent {
    static propTypes = {
        link: PropTypes.string,
        onHide: PropTypes.func.isRequired,
        show: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        link: '',
    }

    render() {
        return (
            <GetLinkModal
                show={this.props.show}
                onHide={this.props.onHide}
                title={Utils.localizeMessage('get_public_link_modal.title', 'Copy Public Link')}
                helpText={Utils.localizeMessage('get_public_link_modal.help', 'The link below allows anyone to see this file without being registered on this server.')}
                link={this.props.link}
            />
        );
    }
}
