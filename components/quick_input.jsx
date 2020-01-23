// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Tooltip} from 'react-bootstrap';

import OverlayTrigger from 'components/overlay_trigger';

import Constants from 'utils/constants.jsx';

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
        inputComponent: PropTypes.elementType,

        /**
         * The string value displayed in this input
         */
        value: PropTypes.string.isRequired,

        /**
         * Whether it shows an X on the input field that clears the input when clicked. Default: false
         */
        clearable: PropTypes.bool,

        /**
         * Function to call when input is cleared when 'X' is clicked.
         */
        onClear: PropTypes.func,
    };

    static defaultProps = {
        delayInputUpdate: false,
        value: '',
        clearable: false,
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
        if (!this.input || this.input.value === this.props.value) {
            return;
        }

        this.input.value = this.props.value;
    }

    get value() {
        return this.input.value;
    }

    set value(value) {
        this.input.value = value;
    }

    focus() {
        this.input.focus();
    }

    blur() {
        this.input.blur();
    }

    getInput = () => {
        return this.input;
    };

    setInput = (input) => {
        this.input = input;
    }

    onClear = () => {
        if (this.props.onClear) {
            this.props.onClear();
        }

        this.value = '';
    }

    render() {
        const clearableTooltip = (
            <Tooltip id={'InputClearTooltip'}>
                <FormattedMessage
                    id={'input.clear'}
                    defaultMessage='Clear input'
                />
            </Tooltip>
        );

        const {value, inputComponent, clearable, ...props} = this.props;

        Reflect.deleteProperty(props, 'delayInputUpdate');
        Reflect.deleteProperty(props, 'onClear');

        const inputElement = React.createElement(
            inputComponent || 'input',
            {
                ...props,
                ref: this.setInput,
                defaultValue: value, // Only set the defaultValue since the real one will be updated using componentDidUpdate
            }
        );

        return (<div>
            {inputElement}
            {clearable && this.input && this.value && this.value !== '' &&
                <div
                    className='input-clear visible'
                    onClick={this.onClear}
                >
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='bottom'
                        overlay={clearableTooltip}
                    >
                        <span
                            className='input-clear-x'
                            aria-hidden='true'
                        >
                            {'×'}
                        </span>
                    </OverlayTrigger>
                </div>
            }
        </div>);
    }
}
