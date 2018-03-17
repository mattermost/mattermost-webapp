// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils';

// A component that can be used to make controlled inputs that function properly in certain
// environments (ie. IE11) where typing quickly would sometimes miss inputs
export default class QuickInput extends React.PureComponent {
    static propTypes = {

        /**
         * Whether to delay updating the value of the textbox from props. Should only be used
         * on textboxes that to properly compose CJK characters as the user types.
         */
        delayInputUpdate: PropTypes.bool,

        /**
         * An optional React component that will be used instead of an HTML input when rendering
         */
        inputComponent: PropTypes.func,

        /**
         * The string value displayed in this input
         */
        value: PropTypes.string.isRequired,
    };

    static defaultProps = {
        delayInputUpdate: false,
    };

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value) {
            if (this.props.delayInputUpdate) {
                requestAnimationFrame(this.updateInputFromProps);
            } else {
                this.updateInputFromProps();
            }
        }
    }

    updateInputFromProps = () => {
        if (UserAgent.isWindows7() && UserAgent.isInternetExplorer()) {
            // The textbox already knows where it's cursor is supposed to be because we've already
            // typed in it, but it needs to be reminded of that
            const caret = Utils.getCaretPosition(this.refs.input);

            this.refs.input.value = this.props.value;

            this.refs.input.selectionStart = caret;
            this.refs.input.selectionEnd = this.refs.input.selectionStart;

            return;
        }

        this.refs.input.value = this.props.value;
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

        Reflect.deleteProperty(props, 'delayInputUpdate');

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
