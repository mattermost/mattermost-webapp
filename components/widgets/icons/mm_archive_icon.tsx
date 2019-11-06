// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import Icon from './base_icon';

type Props = {
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    ariaLabel?: string;
}

export default class ArchiveIcon extends React.PureComponent<Props> {
    render() {
        return (
            <FormattedMessage
                id='generic_icons.archive'
                defaultMessage='Archive Icon'
            >
                {(title) => (
                    <Icon
                        iconClass='icon-archive-outline'
                        componentClass='ArchiveIcon'
                        title={title.toString()}
                        ariaLabel={this.props.ariaLabel}
                        size={this.props.size}
                    />
                )}
            </FormattedMessage>
        );
    }
}
