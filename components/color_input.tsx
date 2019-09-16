// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {ChromePicker, ColorResult} from 'react-color';

const hexRegex: RegExp = /^#[0-9a-fA-F]*$/i;

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

    public constructor(props: Props) {
        super(props);
        this.colorPicker = React.createRef();
        this.state = {
            isOpened: false,
            hex: '#FFFFFF',
        };
    }

    public componentDidMount() {
        this.setState({hex: this.props.color.toUpperCase()});
    }

    public componentDidUpdate(prevProps: Props, prevState: State) {
        const {isOpened: prevIsOpened} = prevState;
        const {isOpened} = this.state;

        if (this.props.color !== prevProps.color) {
            this.setState({hex: this.props.color.toUpperCase()});
        }

        if (isOpened !== prevIsOpened) {
            if (isOpened) {
                document.addEventListener('click', this.checkClick);
            } else {
                document.removeEventListener('click', this.checkClick);
            }
        }
    }

    private checkClick = (e: MouseEvent): void => {
        if (!this.colorPicker.current || !this.colorPicker.current.contains(e.target as Element)) {
            this.setState({isOpened: false});
        }
    };

    private togglePicker = () => {
        this.setState({isOpened: !this.state.isOpened});
    };

    private handleChange = (newColorData: ColorResult) => {
        const {hex} = newColorData;
        const {onChange: handleChange} = this.props;

        if (handleChange) {
            handleChange(hex);
        }
    };

    private onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target;
        if (!hexRegex.test(value)) {
            return;
        }
        if (value.length > 7) {
            return;
        }
        this.setState({hex: value.toUpperCase()});
        const {onChange: handleChange} = this.props;
        if (handleChange && value.length === 7) {
            handleChange(value.toUpperCase());
        }
    };

    private onBlur = () => {
        const {hex} = this.state;
        if (hex.length === 4) {
            const value = hex.split('').map((ch, index) => {
                if (index === 0) {
                    return ch;
                }
                return `${ch}${ch}`;
            }).join('');
            const {onChange: handleChange} = this.props;
            if (handleChange && value.length === 7) {
                handleChange(value.toUpperCase());
            }
        } else {
            this.setState({hex: this.props.color.toUpperCase()});
        }
    };

    public render() {
        const {color, id} = this.props;
        const {isOpened, hex} = this.state;

        return (
            <div className='color-input input-group'>
                <input
                    id={`${id}-inputColorValue`}
                    className='form-control'
                    type='text'
                    value={hex}
                    onChange={this.onChange}
                    onBlur={this.onBlur}
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
                            onChange={this.handleChange}
                            disableAlpha={true}
                        />
                    </div>
                )}
            </div>
        );
    }
}

export default ColorInput;
