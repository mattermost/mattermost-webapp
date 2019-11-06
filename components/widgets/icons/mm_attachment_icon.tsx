// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import Icon from './base_icon';

type Props = {
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    ariaLabel?: string;
}

export default class AttachmentIcon extends React.PureComponent<Props> {
    static defaultProps = {
        size: 'md',
    };

    render() {
        return (
            <FormattedMessage
                id='generic_icons.attach'
                defaultMessage='Attachment Icon'
            >
                {(title) => (
                    <Icon
                        iconClass='icon-paperclip-angled'
                        componentClass='AttachmentIcon'
                        title={title.toString()}
                        ariaLabel={this.props.ariaLabel}
                        size={this.props.size}
                    />
                )}
            </FormattedMessage>
        );
    }
}
