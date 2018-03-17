// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class AutosizeTextarea extends React.Component {
    static propTypes = {
        value: PropTypes.string,
        defaultValue: PropTypes.string,
        placeholder: PropTypes.string,
        onChange: PropTypes.func,
        onHeightChange: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.height = 0;
    }

    get value() {
        return this.refs.textarea.value;
    }

    set value(value) {
        this.refs.textarea.value = value;
    }

    get selectionStart() {
        return this.refs.textarea.selectionStart;
    }

    set selectionStart(selectionStart) {
        this.refs.textarea.selectionStart = selectionStart;
    }

    get selectionEnd() {
        return this.refs.textarea.selectionEnd;
    }

    set selectionEnd(selectionEnd) {
        this.refs.textarea.selectionEnd = selectionEnd;
    }

    focus() {
        this.refs.textarea.focus();
    }

    blur() {
        this.refs.textarea.blur();
    }

    componentDidUpdate() {
        this.recalculateSize();
    }

    recalculateSize = () => {
        const height = this.refs.reference.scrollHeight;

        if (height > 0 && height !== this.height) {
            const textarea = this.refs.textarea;

            const style = getComputedStyle(textarea);
            const borderWidth = parseInt(style.borderTopWidth, 10) + parseInt(style.borderBottomWidth, 10);

            // Directly change the height to avoid circular rerenders
            textarea.style.height = String(height + borderWidth) + 'px';

            this.height = height;

            if (this.props.onHeightChange) {
                this.props.onHeightChange(height, parseInt(style.maxHeight, 10));
            }
        }
    };

    getDOMNode = () => {
        return this.refs.textarea;
    };

    handleChange = (e) => {
        if (this.props.onChange) {
            this.props.onChange(e);
        }
    };

    render() {
        const props = {...this.props};

        Reflect.deleteProperty(props, 'onHeightChange');
        Reflect.deleteProperty(props, 'providers');
        Reflect.deleteProperty(props, 'channelId');

        const {
            value,
            defaultValue,
            placeholder,
            disabled,
            onInput,

            // TODO: The provided `id` is sometimes hard-coded and used to interface with the
            // component, e.g. `post_textbox`, so it can't be changed. This would ideally be
            // abstracted to avoid passing in an `id` prop at all, but we intentionally maintain
            // the old behaviour to address ABC-213.
            id,
            ...otherProps
        } = props;

        const heightProps = {};
        if (this.height <= 0) {
            // Set an initial number of rows so that the textarea doesn't appear too large when its first rendered
            heightProps.rows = 1;
        } else {
            heightProps.height = this.height;
        }

        return (
            <div>
                <textarea
                    ref='textarea'
                    id={id}
                    {...heightProps}
                    {...otherProps}
                    disabled={disabled}
                    placeholder={placeholder}
                    onChange={this.handleChange}
                    onInput={onInput}
                    value={value}
                    defaultValue={defaultValue}
                />
                <div style={style.container}>
                    <textarea
                        ref='reference'
                        id={id + '-reference'}
                        style={style.reference}
                        disabled={true}
                        placeholder={placeholder}
                        rows='1'
                        {...otherProps}
                        value={value || defaultValue || placeholder}
                    />
                </div>
            </div>
        );
    }
}

const style = {
    container: {height: 0, overflow: 'hidden'},
    reference: {height: 'auto', width: '100%'},
};
