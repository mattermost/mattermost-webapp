// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {FormattedMessage} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import Constants from 'utils/constants.jsx';
import {copyToClipboard} from 'utils/utils.jsx';

export default class CopyText extends React.PureComponent {
    static propTypes = {
        value: PropTypes.string.isRequired,

        defaultMessage: PropTypes.string,

        idMessage: PropTypes.string,
    };

    static get defaultProps() {
        return {
            idMessage: 'integrations.copy',
            defaultMessage: 'Copy',
        };
    }

    copyText = (e) => {
        e.preventDefault();
        copyToClipboard(this.props.value);
    };

    render() {
        if (!document.queryCommandSupported('copy')) {
            return null;
        }

        const tooltip = (
            <Tooltip id='copy'>
                <FormattedMessage
                    id={this.props.idMessage}
                    defaultMessage={this.props.defaultMessage}
                />
            </Tooltip>
        );

        return (
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                overlay={tooltip}
            >
                <a
                    href='#'
                    className='fa fa-copy margin-left'
                    onClick={this.copyText}
                />
            </OverlayTrigger>
        );
    }
}
