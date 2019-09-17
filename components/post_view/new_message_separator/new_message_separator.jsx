// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Separator from 'components/widgets/separator/separator';

export default class NewMessageSeparator extends React.PureComponent {
    static propTypes = {
        separatorId: PropTypes.string.isRequired,
    }

    render() {
        return (
            <Separator
                id={this.props.separatorId}
                className='new-separator'
            >
                <FormattedMessage
                    id='posts_view.newMsg'
                    defaultMessage='New Messages'
                />

            </Separator>
        );
    }
}
