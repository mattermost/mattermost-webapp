// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import UnreadBelowIcon from 'components/widgets/icons/unread_below_icon';

export default class UnreadChannelIndicator extends React.PureComponent {
    static propTypes = {

        /**
         * Function to call when the indicator is clicked
         */
        onClick: PropTypes.func.isRequired,

        /**
         * Set whether to show the indicator or not
         */
        show: PropTypes.bool,

        /**
         * The additional CSS class for the indicator
         */
        extraClass: PropTypes.string,

        /**
         * The content of the indicator
         */
        content: PropTypes.node,

        /**
         * The name of the indicator
         */
        name: PropTypes.string,
    };

    static defaultProps = {
        show: false,
        extraClass: '',
        content: '',
    };

    render() {
        let displayValue = 'none';
        if (this.props.show) {
            displayValue = 'block';
        }

        return (
            <div
                id={'unreadIndicator' + this.props.name}
                className={'nav-pills__unread-indicator ' + this.props.extraClass}
                style={{display: displayValue}}
                onClick={this.props.onClick}
            >
                {this.props.content}
                <UnreadBelowIcon className='icon icon__unread'/>
            </div>
        );
    }
}
