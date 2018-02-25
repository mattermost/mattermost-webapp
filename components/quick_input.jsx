// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

// A component that can be used to make controlled inputs that function properly in certain
// environments (ie. IE11) where typing quickly would sometimes miss inputs
export default class QuickInput extends React.PureComponent {
    static propTypes = {

        /**
         * An optional React component that will be used instead of an HTML input when rendering
         */
        inputComponent: PropTypes.func,

        /**
         * The string value displayed in this input
         */
        value: PropTypes.string.isRequired,
    };

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value) {
            requestAnimationFrame(() => {
                this.refs.input.value = this.props.value;
            });
        }
    }

    get value() {
        return this.refs.input.value;
    }

    set value(value) {
        this.refs.input.value = value;
    }

    focus() {
        this.refs.input.focus();
    }

    blur() {
        this.refs.input.blur();
    }

    getInput = () => {
        return this.refs.input;
    };

    render() {
        const {value, inputComponent, ...props} = this.props;

        return React.createElement(
            inputComponent || 'input',
            {
                ...props,
                ref: 'input',
                defaultValue: value, // Only set the defaultValue since the real one will be updated using componentDidUpdate
            }
        );
    }
}
