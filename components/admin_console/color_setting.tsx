// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {ChromePicker, ColorResult} from 'react-color';

import Setting from './setting';

type State = {
    showPicker: boolean;
}
type Props = {
    id: string;
    label: React.ReactNode;
    helpText?: React.ReactNode;
    value: string;
    onChange?: (id: string, color: string) => void;
    disabled?: boolean;
}

export default class ColorSetting extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            showPicker: false,
        };
    }

    public componentDidMount() {
        document.addEventListener('click', this.closePicker);
    }

    public componentWillUnmount() {
        document.removeEventListener('click', this.closePicker);
    }

    private handleChange = (color: ColorResult) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.id, color.hex);
        }
    }

    private togglePicker = () => {
        if (this.props.disabled) {
            this.setState({showPicker: false});
        } else {
            this.setState({showPicker: !this.state.showPicker});
        }
    }

    private closePicker = (e: MouseEvent) => {
        if (e.target) {
            const closest = (e.target as HTMLElement).closest('.' + this.getPickerClass());
            if (!closest || !closest.contains(e.target as HTMLElement)) {
                this.setState({showPicker: false});
            }
        }
    }

    private onTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.id, e.target.value);
        }
    }

    private getPickerClass = () => {
        return this.props.id ? 'picker-' + this.props.id.replace('.', '-') : '';
    }

    public render() {
        let picker;
        if (this.state.showPicker) {
            picker = (
                <div className={'color-picker__popover ' + this.getPickerClass()}>
                    <ChromePicker
                        color={this.props.value}
                        onChange={this.handleChange}
                    />
                </div>
            );
        }

        return (
            <Setting
                label={this.props.label}
                helpText={this.props.helpText}
                inputId={this.props.id}
            >
                <div className='input-group color-picker colorpicker-element'>
                    <input
                        type='text'
                        className='form-control'
                        value={this.props.value}
                        onChange={this.onTextInput}
                        disabled={this.props.disabled}
                    />
                    <span
                        className={'input-group-addon ' + this.getPickerClass()}
                        onClick={this.togglePicker}
                    >
                        <i style={{backgroundColor: this.props.value}}/>
                    </span>
                    {picker}
                </div>
            </Setting>
        );
    }
}
