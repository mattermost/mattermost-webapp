// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {ChromePicker, ColorResult} from 'react-color';

type Props = {
    id: string;
    color: string;
    onChange?: (hex: string) => void;
}

type State = {
    isOpened: boolean;
}

class ColorInput extends React.PureComponent<Props, State> {
    private colorPicker: React.RefObject<HTMLDivElement>;

    public constructor(props: Props) {
        super(props);
        this.colorPicker = React.createRef();
        this.state = {
            isOpened: false,
        };
    }

    public componentDidUpdate(prevProps: Props, prevState: State) {
        const {isOpened: prevIsOpened} = prevState;
        const {isOpened} = this.state;

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

    public render() {
        const {color, id} = this.props;
        const {isOpened} = this.state;

        return (
            <div className='color-input input-group'>
                <input
                    id={`${id}-inputColorValue`}
                    className='form-control'
                    type='text'
                    value={color}
                    readOnly={true}
                />
                <span
                    id={`${id}-squareColorIcon`}
                    className='input-group-addon'
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
                        />
                    </div>
                )}
            </div>
        );
    }
}

export default ColorInput;
