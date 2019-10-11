// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import Constants from 'utils/constants.jsx';
import {copyToClipboard} from 'utils/utils.jsx';

type Props = {
    value: string;
    defaultMessage: string;
    idMessage: string;
};

export default class CopyText extends React.PureComponent<Props, {}> {
    public static defaultProps = {
        defaultMessage: 'Copy',
        idMessage: 'integrations.copy',
    };

    private copyText = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
        e.preventDefault();
        copyToClipboard(this.props.value);
    };

    public render() {
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
