// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {intlShape} from 'react-intl';

export default class LocalizedInput extends React.Component {
    static propTypes = {

        placeholder: PropTypes.shape({
            id: PropTypes.string.isRequired,
            defaultMessage: PropTypes.string.isRequired,
        }).isRequired,
        value: PropTypes.string,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    constructor(props) {
        super(props);

        this.input = React.createRef();
    }

    get value() {
        return this.input.current.value;
    }

    set value(value) {
        this.input.current.value = value;
    }

    focus = () => {
        this.input.current.focus();
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.value !== this.props.value ||
            nextProps.placeholder.id !== this.props.placeholder.id ||
            nextProps.placeholder.defaultMessage !== this.props.placeholder.defaultMessage;
    }

    render() {
        const {formatMessage} = this.context.intl;
        const {placeholder, ...otherProps} = this.props;
        const placeholderString = formatMessage(placeholder);

        return (
            <input
                ref={this.input}
                {...otherProps}
                placeholder={placeholderString}
            />
        );
    }
}
