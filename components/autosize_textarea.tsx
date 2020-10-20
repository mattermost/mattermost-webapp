// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, FormEvent, CSSProperties} from 'react';

type Props = {
    id?: string;
    disabled?: boolean;
    value?: string;
    defaultValue?: string;
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    onHeightChange?: (height: number, maxHeight: number) => void;
    onInput?: (e: FormEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
}

export default class AutosizeTextarea extends React.PureComponent<Props> {
    private height: number;
    private textareaRef: React.RefObject<HTMLTextAreaElement>;
    private reference: React.RefObject<HTMLTextAreaElement>;
    constructor(props: Props) {
        super(props);

        this.height = 0;

        this.textareaRef = React.createRef();
        this.reference = React.createRef();
    }

    get value() {
        return this.textareaRef.current?.value;
    }

    set value(value) {
        if (this.textareaRef.current && value) {
            this.textareaRef.current.value = value;
        }
    }

    get selectionStart() {
        return this.textareaRef.current?.selectionStart;
    }

    set selectionStart(selectionStart) {
        if (this.textareaRef.current && selectionStart) {
            this.textareaRef.current.selectionStart = selectionStart;
        }
    }

    get selectionEnd() {
        return this.textareaRef.current?.selectionEnd;
    }

    set selectionEnd(selectionEnd) {
        if (this.textareaRef.current && selectionEnd) {
            this.textareaRef.current.selectionStart = selectionEnd;
        }
    }

    focus() {
        this.textareaRef.current?.focus();
    }

    blur() {
        this.textareaRef.current?.blur();
    }

    componentDidMount() {
        this.recalculateSize();
    }

    componentDidUpdate() {
        this.recalculateSize();
    }

    recalculateSize = () => {
        if (!this.reference.current || !(this.textareaRef.current)) {
            return;
        }

        const height = (this.reference.current).scrollHeight;
        const textarea = (this.textareaRef.current);

        if (height > 0 && height !== this.height) {
            const style = getComputedStyle(textarea);
            const borderWidth = parseInt(style.borderTopWidth || '0', 10) + parseInt(style.borderBottomWidth || '0', 10);

            // Directly change the height to avoid circular rerenders
            textarea.style.height = String(height + borderWidth) + 'px';

            this.height = height;

            window.requestAnimationFrame(() => {
                this.props.onHeightChange?.(height, parseInt(style.maxHeight || '0', 10));
            });
        }
    }

    getDOMNode = () => {
        return (this.textareaRef.current);
    };

    handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

        const heightProps = {
            rows: 0,
            height: 0,
        };

        if (this.height <= 0) {
            // Set an initial number of rows so that the textarea doesn't appear too large when its first rendered
            heightProps.rows = 1;
        } else {
            heightProps.height = this.height;
        }

        let textareaPlaceholder = null;
        const placeholderAriaLabel = placeholder ? placeholder.toLowerCase() : '';
        if (!this.props.value && !this.props.defaultValue) {
            textareaPlaceholder = (
                <div
                    {...otherProps as any}
                    data-testid={`${id}_placeholder`}
                    style={style.placeholder}
                >
                    {placeholder}
                </div>
            );
        }

        return (
            <div>
                {textareaPlaceholder}
                <textarea
                    ref={this.textareaRef}
                    data-testid={id}
                    id={id}
                    {...heightProps}
                    {...otherProps}
                    role='textbox'
                    aria-label={placeholderAriaLabel}
                    disabled={disabled}
                    onChange={this.handleChange}
                    onInput={onInput}
                    value={value}
                    defaultValue={defaultValue}
                />
                <div style={style.container}>
                    <textarea
                        ref={this.reference}
                        id={id + '-reference'}
                        style={style.reference}
                        disabled={true}
                        rows={1}
                        {...otherProps}
                        value={value || defaultValue}
                        aria-hidden={true}
                    />
                </div>
            </div>
        );
    }
}

const style: { [Key: string]: CSSProperties} = {
    container: {height: 0, overflow: 'hidden'},
    reference: {height: 'auto', width: '100%'},
    placeholder: {overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.5, pointerEvents: 'none', position: 'absolute', whiteSpace: 'nowrap', background: 'none', borderColor: 'transparent'},
};
