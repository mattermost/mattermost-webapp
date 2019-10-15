// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FormEvent, ChangeEvent, createRef, RefObject} from 'react';

interface Props {
    id: string;
    disabled: boolean;
    value: string;
    defaultValue: string;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    onHeightChange: (height: number, maxHeight: number) => void;
    onInput: (e: FormEvent<HTMLTextAreaElement>) => void;
}

interface DefaultProps {
    placeholder?: string;
}

type AutosizeTextareaProps = DefaultProps & Props;

export default class AutosizeTextarea extends React.Component<AutosizeTextareaProps> {
    private height: number;
    private textareaRef: RefObject<HTMLTextAreaElement>
    private referenceRef: RefObject<HTMLTextAreaElement>

    public constructor(props: AutosizeTextareaProps) {
        super(props);

        this.height = 0;

        this.textareaRef = createRef<HTMLTextAreaElement>();
        this.referenceRef = createRef<HTMLTextAreaElement>();
    }

    private getTextareaValue(key: keyof HTMLTextAreaElement, defaultValue?: any) {
        return this.textareaRef.current ? this.textareaRef.current[key] : defaultValue;
    }

    private setTextAreaValue(key: keyof Pick<HTMLTextAreaElement, 'value' | 'selectionStart' | 'selectionEnd'>, value: string | number) {
        if (this.textareaRef.current) {
            // @ts-ignore
            this.textareaRef.current[key] = value;
        }
    }

    public get value() {
        return this.getTextareaValue('value', '');
    }

    public set value(value: string) {
        this.setTextAreaValue('value', value);
    }

    public get selectionStart() {
        return this.getTextareaValue('selectionStart', 0);
    }

    public set selectionStart(selectionStart: number) {
        this.setTextAreaValue('selectionStart', selectionStart);
    }

    public get selectionEnd() {
        return this.getTextareaValue('selectionEnd', 0);
    }

    public set selectionEnd(selectionEnd: number) {
        this.setTextAreaValue('selectionEnd', selectionEnd);
    }

    public focus() {
        if (this.textareaRef.current) {
            this.textareaRef.current.focus();
        }
    }

    public blur() {
        if (this.textareaRef.current) {
            this.textareaRef.current.blur();
        }
    }

    public componentDidMount() {
        this.recalculateSize();
    }

    public componentDidUpdate() {
        this.recalculateSize();
    }

    public recalculateSize = () => {
        if (!this.refs.reference || !this.refs.textarea) {
            return;
        }

        const height = this.referenceRef.current ? this.referenceRef.current.scrollHeight : 0;
        const textarea = this.textareaRef.current;

        if (height > 0 && height !== this.height) {
            const style = textarea ? getComputedStyle(textarea) : null;
            const borderWidth = style && style.borderTopWidth && style.borderBottomWidth ? parseInt(style.borderTopWidth, 10) + parseInt(style.borderBottomWidth, 10) : 0;

            // Directly change the height to avoid circular rerenders
            if (textarea) {
                textarea.style.height = String(height + borderWidth) + 'px';
            }

            this.height = height;

            if (this.props.onHeightChange && style && style.maxHeight) {
                this.props.onHeightChange(height, parseInt(style.maxHeight, 10));
            }
        }
    };

    public getDOMNode = () => {
        return this.refs.textarea;
    };

    public handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (this.props.onChange) {
            this.props.onChange(e);
        }
    };

    public render() {
        const props = {...this.props};

        Reflect.deleteProperty(props, 'onHeightChange');
        Reflect.deleteProperty(props, 'providers');
        Reflect.deleteProperty(props, 'channelId');

        const {
            value,
            defaultValue,
            placeholder = '',
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
        const placeholderAriaLabel = placeholder.toLowerCase();
        if (!this.props.value && !this.props.defaultValue) {
            textareaPlaceholder = (

                // @ts-ignore for now
                <div
                    {...otherProps}
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
                        ref={this.referenceRef}
                        id={id + '-reference'}
                        style={style.reference}
                        disabled={true}
                        rows={1}
                        {...otherProps}
                        value={value || defaultValue}
                    />
                </div>
            </div>
        );
    }
}

const style: { [Key: string]: React.CSSProperties} = {
    container: {height: 0, overflow: 'hidden'},
    reference: {height: 'auto', width: '100%'},
    placeholder: {overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.5, pointerEvents: 'none', position: 'absolute', whiteSpace: 'nowrap', background: 'none'},
};
