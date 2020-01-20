// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {ChromePicker, ColorResult} from 'react-color';

const hexRegex = /^#([\da-f]{3}|[\da-f]{6})$/i;

type Props = {
    id: string;
    color: string;
    onChange?: (hex: string) => void;
}

type State = {
    isOpened: boolean;
    hex: string;
}

class ColorInput extends React.PureComponent<Props, State> {
    private colorPicker: React.RefObject<HTMLDivElement>;
    private colorInput: React.RefObject<HTMLInputElement>;

    public constructor(props: Props) {
        super(props);
        this.colorPicker = React.createRef();
        this.colorInput = React.createRef();
        this.state = {
            isOpened: false,
            hex: this.props.color.toUpperCase(),
        };
    }

    public componentWillMount() {
        this.setHex();
    }

    public componentDidUpdate(prevProps: Props, prevState: State) {
        const {isOpened: prevIsOpened} = prevState;
        const {isOpened} = this.state;

        if (this.props.color !== prevProps.color && this.ensureLongColourValue(this.state.hex) !== this.props.color) {
            this.setHex();
        }

        if (isOpened !== prevIsOpened) {
            if (isOpened) {
                document.addEventListener('click', this.checkClick);
            } else {
                document.removeEventListener('click', this.checkClick);
            }
        }
    }

    private setHex() {
        this.setState({hex: this.props.color.toUpperCase()});
    }

    private checkClick = (e: MouseEvent): void => {
        if (!this.colorPicker.current || !this.colorPicker.current.contains(e.target as Element)) {
            this.setState({isOpened: false});
        }
    };

    private togglePicker = () => {
        if (!this.state.isOpened && this.colorInput.current) {
            this.colorInput.current.focus();
        }
        this.setState({isOpened: !this.state.isOpened});
    };

    public handleColorChange = (newColorData: ColorResult) => {
        const {hex} = newColorData;
        const {onChange: handleChange} = this.props;

        if (handleChange) {
            handleChange(hex);
        }
    };

    private ensureLongColourValue = (value: string) => {
        if (value.length !== 4) {
            return value;
        }
        return value.split('').map((ch, index) => {
            if (index === 0) {
                return ch;
            }
            return `${ch}${ch}`;
        }).join('');
    }

    private onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let {value} = event.target;
        if (!value.startsWith('#')) {
            value = '#' + value;
        }
        if (!hexRegex.test(value)) {
            return;
        }
        this.setState({hex: value});
        const {onChange: handleChange} = this.props;
        if (handleChange) {
            handleChange(this.ensureLongColourValue(value));
        }
    };

    private onBlur = () => {
        const {hex} = this.state;
        if (hex.length === 4) {
            const value = this.ensureLongColourValue(hex);
            const {onChange: handleChange} = this.props;
            if (handleChange && value.length === 7) {
                handleChange(value);
                this.setState({hex: value.toUpperCase()});
            }
        } else {
            this.setHex();
        }
    };

    private onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // open picker on enter or space
        if (event.key === 'Enter' || event.key === ' ') {
            this.togglePicker();
        }
    };

    private selectValue = (event: React.FocusEvent<HTMLInputElement>): void => {
        if (event.target) {
            event.target.setSelectionRange(1, event.target.value.length);
        }
    }

    public render() {
        const {color, id} = this.props;
        const {isOpened, hex} = this.state;

        return (
            <div className='color-input input-group'>
                <input
                    id={`${id}-inputColorValue`}
                    ref={this.colorInput}
                    className='form-control'
                    type='text'
                    value={hex}
                    onChange={this.onChange}
                    onBlur={this.onBlur}
                    onKeyDown={this.onKeyDown}
                    onFocus={this.selectValue}
                />
                <span
                    id={`${id}-squareColorIcon`}
                    className='input-group-addon color-pad'
                    onClick={this.togglePicker}
                >
                    <i
                        id={`${id}-squareColorIconValue`}
                        className='color-icon'
                        style={{
                            backgroundColor: color,
                        }}
                    />
                </span>
                {isOpened && (
                    <div
                        ref={this.colorPicker}
                        className='color-popover'
                        id={`${id}-ChromePickerModal`}
                    >
                        <ChromePicker
                            color={color}
                            onChange={this.handleColorChange}
                            disableAlpha={true}
                        />
                    </div>
                )}
            </div>
        );
    }
}

export default ColorInput;
