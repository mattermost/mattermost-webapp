// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

export default class PermissionCheckbox extends React.PureComponent {
    static propTypes = {
        value: PropTypes.string.isRequired,
    };

    static defaultProps = {
        value: '',
    }

    render() {
        const {value} = this.props;
        let icon = null;
        let extraClass = '';
        if (value === 'checked') {
            icon = (<span className='fa fa-check'/>);
            extraClass = 'checked';
        } else if (value === 'intermediate') {
            icon = (<span className='fa fa-minus'/>);
            extraClass = 'intermediate';
        }
        return (
            <div className={'permission-check ' + extraClass}>
                {icon}
            </div>
        );
    }
}
