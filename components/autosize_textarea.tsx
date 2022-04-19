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
    forwardedRef?: ((instance: HTMLTextAreaElement | null) => void) | React.MutableRefObject<HTMLTextAreaElement | null> | null;
}

export class AutosizeTextarea extends React.PureComponent<Props> {
    private height: number;

    private textarea?: HTMLTextAreaElement;
    private referenceRef: React.RefObject<HTMLTextAreaElement>;

    constructor(props: Props) {
        super(props);

        this.height = 0;

        this.referenceRef = React.createRef();
    }

    componentDidMount() {
        this.recalculateSize();
    }

    componentDidUpdate() {
        this.recalculateSize();
    }

    private recalculateSize = () => {
        if (!this.referenceRef.current || !this.textarea) {
            return;
        }

        const height = (this.referenceRef.current).scrollHeight;
        const textarea = this.textarea;

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

    private setTextareaRef = (textarea: HTMLTextAreaElement) => {
        if (this.props.forwardedRef) {
            if (typeof this.props.forwardedRef === 'function') {
                this.props.forwardedRef(textarea);
            } else {
                this.props.forwardedRef.current = textarea;
            }
        }

        this.textarea = textarea;
    }

    render() {
        const props = {...this.props};

        Reflect.deleteProperty(props, 'onHeightChange');
        Reflect.deleteProperty(props, 'providers');
        Reflect.deleteProperty(props, 'channelId');
        Reflect.deleteProperty(props, 'forwardedRef');

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
                    ref={this.setTextareaRef}
                    data-testid={id}
                    id={id}
                    {...heightProps}
                    {...otherProps}
                    role='textbox'
                    aria-label={placeholderAriaLabel}
                    dir='auto'
                    disabled={disabled}
                    onChange={this.props.onChange}
                    onInput={onInput}
                    value={value}
                    defaultValue={defaultValue}
                />
                <div style={style.container}>
                    <textarea
                        ref={this.referenceRef}
                        id={id + '-reference'}
                        style={style.reference}
                        dir='auto'
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

const forwarded = React.forwardRef<HTMLTextAreaElement>((props, ref) => (
    <AutosizeTextarea
        forwardedRef={ref}
        {...props}
    />
));
forwarded.displayName = 'AutosizeTextarea';

export default forwarded;
