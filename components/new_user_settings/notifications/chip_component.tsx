// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import ReactSelect, {InputActionMeta} from 'react-select';

import Constants from 'utils/constants';

interface Props {
    values: string[];
    setCustom?: (t: any) => void;
    removeOne?: (t: any) => void;
}

export type State = {

    // a11yActive: boolean;
    input: string;

    // page: number;
};

const KeyCodes = Constants.KeyCodes;

export default class ChipComponent extends React.PureComponent<Props, State> {
    private reactSelectRef = React.createRef<ReactSelect>();
    constructor(props: any) {
        super(props);
        this.state = {
            input: '',
        };
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (prevState.input !== this.state.input) {
            this.setState({input: this.state.input});
            console.log(this.state.input);
        }
    }

    onInput = (input: string, change: InputActionMeta) => {
        if (!change) {
            return;
        }
        if (change.action === 'input-blur' || change.action === 'menu-close') {
            return;
        }

        if (this.state.input === input) {
            return;
        }

        this.setState({input: input.replace(/ /g, '')});
    };
    private onChange: ReactSelect['onChange'] = (_, change) => {
        if (change.action !== 'remove-value' && change.action !== 'pop-value') {
            return;
        }

        const values = [...this.props.values];
        for (let i = 0; i < values.length; i++) {
            // Types of ReactSelect do not match the behavior here,
            if (values[i] === (change as any).removedValue.label) {
                const v = values.filter(
                    (a: string) => a !== (change as any).removedValue.label,
                );
                console.log(v);
                this.props.removeOne!(v.join(','));
                break;
            }
        }
    };
    private onInputKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
        case KeyCodes.ENTER[0]:
            e.preventDefault();
            this.props.setCustom!(this.state.input);
            this.setState({input: ''});
            break;
        }
    };
    render() {
        const nullComponent = () => null;
        return (
            <ReactSelect
                id='selectItems'
                ref={this.reactSelectRef as React.RefObject<any>} // type of ref on @types/react-select is outdated
                isMulti={true}
                components={{
                    Menu: nullComponent,
                    IndicatorsContainer: nullComponent,
                }}
                isClearable={false}
                openMenuOnFocus={false}
                menuIsOpen={false}
                onInputChange={this.onInput}
                onKeyDown={this.onInputKeyDown as React.KeyboardEventHandler}
                onChange={this.onChange}
                value={this.props.values.map((a: any) => {
                    return {label: a, value: a};
                })}
                placeholder={'Enter other keywords'}
                inputValue={this.state.input}
                aria-label={'Enter other keywords'}
                classNamePrefix='react-select-auto react-select'
            />
        );
    }
}
