// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import CheckboxCheckedIcon from 'components/widgets/icons/checkbox_checked_icon.jsx';
import CheckboxPartialIcon from 'components/widgets/icons/checkbox_partial_icon.jsx';

export default class PermissionCheckbox extends React.PureComponent {
    static propTypes = {
        value: PropTypes.string.isRequired,
        id: PropTypes.string,
    };

    static defaultProps = {
        value: '',
        id: '',
    }

    render() {
        const {value, id} = this.props;
        let icon = null;
        let extraClass = '';
        if (value === 'checked') {
            icon = (<CheckboxCheckedIcon/>);
            extraClass = 'checked';
        } else if (value === 'intermediate') {
            icon = (<CheckboxPartialIcon/>);
            extraClass = 'intermediate';
        }
        return (
            <div
                className={'permission-check ' + extraClass}
                data-testid={id}
            >
                {icon}
            </div>
        );
    }
}
