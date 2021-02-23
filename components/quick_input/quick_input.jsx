// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Tooltip} from 'react-bootstrap';
import classNames from 'classnames';

import OverlayTrigger from 'components/overlay_trigger';
import AutosizeTextarea from 'components/autosize_textarea';
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
         * When true, and an onClear callback is defined, show an X on the input field that clears
         * the input when clicked.
         */
        clearable: PropTypes.bool,

        /**
         * The optional tooltip text to display on the X shown when clearable. Pass a components
         * such as FormattedMessage to localize.
         */
        clearableTooltipText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

        /**
         * Callback to clear the input value, and used in tandem with the clearable prop above.
         */
        onClear: PropTypes.func,

        /**
         * ClassName for the clear button container
         */
        clearClassName: PropTypes.string,

        /**
         * Position in which the tooltip will be displayed
         */
        tooltipPosition: PropTypes.oneOf(['top', 'bottom']),

        /**
         * Callback to handle the change event of the input
         */
        onChange: PropTypes.func,
    };

    static defaultProps = {
        delayInputUpdate: false,
        value: '',
        clearable: false,
        tooltipPosition: 'bottom',
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

    onClear = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.onClear) {
            this.props.onClear();
        }
        this.focus();
    }

    render() {
        let clearableTooltipText = this.props.clearableTooltipText;
        if (!clearableTooltipText) {
            clearableTooltipText = (
                <FormattedMessage
                    id={'input.clear'}
                    defaultMessage='Clear'
                />
            );
        }

        const clearableTooltip = (
            <Tooltip id={'InputClearTooltip'}>
                {clearableTooltipText}
            </Tooltip>
        );

        const {value, inputComponent, clearable, clearClassName, tooltipPosition, ...props} = this.props;

        Reflect.deleteProperty(props, 'delayInputUpdate');
        Reflect.deleteProperty(props, 'onClear');
        Reflect.deleteProperty(props, 'clearableTooltipText');
        Reflect.deleteProperty(props, 'channelId');
        Reflect.deleteProperty(props, 'clearClassName');
        Reflect.deleteProperty(props, 'tooltipPosition');

        if (inputComponent !== AutosizeTextarea) {
            Reflect.deleteProperty(props, 'onHeightChange');
        }

        const inputElement = React.createElement(
            inputComponent || 'input',
            {
                ...props,
                ref: this.setInput,
                defaultValue: value, // Only set the defaultValue since the real one will be updated using componentDidUpdate
            },
        );

        return (<div>
            {inputElement}
            {clearable && value && this.props.onClear &&
                <div
                    className={classNames(clearClassName, 'input-clear visible')}
                    onMouseDown={this.onClear}
                    onTouchEnd={this.onClear}
                >
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement={tooltipPosition}
                        overlay={clearableTooltip}
                    >
                        <span
                            className='input-clear-x'
                            aria-hidden='true'
                        >
                            <i className='icon icon-close-circle'/>
                        </span>
                    </OverlayTrigger>
                </div>
            }
        </div>);
    }
}
