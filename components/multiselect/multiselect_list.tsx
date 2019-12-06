// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {getOptionValue} from 'react-select/src/builtins';

import Constants from 'utils/constants';
import {cmdOrCtrlPressed} from 'utils/utils.jsx';

import LoadingScreen from 'components/loading_screen';

import {Value} from './multiselect';

export type Props = {
    ariaLabelRenderer: getOptionValue<Value>;
    loading?: boolean;
    onAdd: (value: Value) => void;
    onPageChange?: (newPage: number, currentPage: number) => void;
    onSelect: (value: Value | null) => void;
    optionRenderer: (
        option: Value,
        isSelected: boolean,
        onAdd: (value: Value) => void,
        onMouseMove: (value: Value) => void
    ) => void;
    options: Value[];
    page: number;
    perPage: number;
}

type State = {
    selected: number;
}
const KeyCodes = Constants.KeyCodes;

export default class MultiSelectList extends React.Component<Props, State> {
    public static defaultProps = {
        options: [],
        perPage: 50,
        onAction: () => null,
    };

    private toSelect = -1
    private listRef = React.createRef<HTMLDivElement>()
    private selectedRef = React.createRef<HTMLDivElement>()

    public constructor(props: Props) {
        super(props);

        this.state = {
            selected: -1,
        };
    }

    public componentDidMount() {
        document.addEventListener('keydown', this.handleArrowPress);
    }

    public componentWillUnmount() {
        document.removeEventListener('keydown', this.handleArrowPress);
    }

    public componentDidUpdate(_: Props, prevState: State) {
        const options = this.props.options;
        if (options && options.length > 0 && this.state.selected >= 0) {
            this.props.onSelect(options[this.state.selected]);
        }

        if (prevState.selected === this.state.selected) {
            return;
        }

        if (this.listRef.current && this.selectedRef.current) {
            const elemTop = this.selectedRef.current.getBoundingClientRect().top;
            const elemBottom = this.selectedRef.current.getBoundingClientRect().bottom;
            const listTop = this.listRef.current.getBoundingClientRect().top;
            const listBottom = this.listRef.current.getBoundingClientRect().bottom;
            if (elemBottom > listBottom) {
                this.selectedRef.current.scrollIntoView(false);
            } else if (elemTop < listTop) {
                this.selectedRef.current.scrollIntoView(true);
            }
        }
    }

    // setSelected updates the selected index and is referenced
    // externally by the MultiSelect component.
    public setSelected = (selected: number) => {
        this.setState({selected});
    }

    private handleArrowPress = (e: KeyboardEvent) => {
        if (cmdOrCtrlPressed(e) && e.shiftKey) {
            return;
        }

        const options = this.props.options;
        if (options.length === 0) {
            return;
        }

        let selected;
        switch (e.key) {
        case KeyCodes.DOWN[0]:
            if (this.state.selected === -1) {
                selected = 0;
                break;
            }
            selected = Math.min(this.state.selected + 1, options.length - 1);
            break;
        case KeyCodes.UP[0]:
            if (this.state.selected === -1) {
                selected = 0;
                break;
            }
            selected = Math.max(this.state.selected - 1, 0);
            break;
        default:
            return;
        }

        e.preventDefault();
        this.setState({selected});
        this.props.onSelect(options[selected]);
    }

    private defaultOptionRenderer = (option: Value, isSelected: boolean, onAdd: Props['onAdd'], onMouseMove: (value: Value) => void) => {
        let rowSelected = '';
        if (isSelected) {
            rowSelected = 'more-modal__row--selected';
        }

        return (
            <div
                ref={isSelected ? 'selected' : option.value}
                className={rowSelected}
                key={'multiselectoption' + option.value}
                onClick={() => onAdd(option)}
                onMouseMove={() => onMouseMove(option)}
            >
                {option.label}
            </div>
        );
    }

    private onMouseMove = (option: Value) => {
        const i = this.props.options.indexOf(option);
        if (i !== -1) {
            if (this.state.selected !== i) {
                this.setSelected(i);
            }
        }
    }

    public render() {
        const options = this.props.options;
        let renderOutput;

        if (this.props.loading) {
            renderOutput = (
                <div aria-hidden={true}>
                    <LoadingScreen
                        position='absolute'
                        key='loading'
                    />
                </div>
            );
        } else if (options == null || options.length === 0) {
            renderOutput = (
                <div
                    key='no-users-found'
                    className='no-channel-message'
                >
                    <p className='primary-message'>
                        <FormattedMessage
                            id='multiselect.list.notFound'
                            defaultMessage='No items found'
                        />
                    </p>
                </div>
            );
        } else {
            let renderer: Props['optionRenderer'];
            if (this.props.optionRenderer) {
                renderer = this.props.optionRenderer;
            } else {
                renderer = this.defaultOptionRenderer;
            }

            const optionControls = options.map((o, i) => renderer(o, this.state.selected === i, this.props.onAdd, this.onMouseMove));

            const selectedOption = options[this.state.selected];
            const ariaLabel = this.props.ariaLabelRenderer(selectedOption);

            renderOutput = (
                <div className='more-modal__list'>
                    <div
                        className='sr-only'
                        aria-live='polite'
                        aria-atomic='true'
                    >
                        {ariaLabel}
                    </div>
                    <div
                        ref='list'
                        id='multiSelectList'
                        role='presentation'
                        aria-hidden={true}
                    >
                        {optionControls}
                    </div>
                </div>
            );
        }

        return (
            <div
                className='multi-select__wrapper'
                aria-live='polite'
            >
                {renderOutput}
            </div>
        );
    }
}

