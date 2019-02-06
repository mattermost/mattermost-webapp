// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import Scrollbars from 'react-custom-scrollbars';

import Constants from 'utils/constants.jsx';
import {cmdOrCtrlPressed} from 'utils/utils.jsx';
import LoadingScreen from 'components/loading_screen.jsx';
const KeyCodes = Constants.KeyCodes;

export default class MultiSelectList extends React.Component {
    constructor(props) {
        super(props);

        this.listScrollBar = React.createRef();
        this.defaultOptionRenderer = this.defaultOptionRenderer.bind(this);
        this.handleArrowPress = this.handleArrowPress.bind(this);
        this.setSelected = this.setSelected.bind(this);

        this.toSelect = -1;

        this.state = {
            selected: -1,
        };
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleArrowPress);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleArrowPress);
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        this.setState({selected: this.toSelect});

        const options = nextProps.options;

        if (options && options.length > 0 && this.toSelect >= 0) {
            this.props.onSelect(options[this.toSelect]);
        }
    }

    componentDidUpdate(_, prevState) {
        if (prevState.selected === this.state.selected) {
            return;
        }

        if (this.refs.list && this.refs.selected) {
            const elemTop = this.refs.selected.getBoundingClientRect().top;
            const elemBottom = this.refs.selected.getBoundingClientRect().bottom;
            const listTop = this.refs.list.getBoundingClientRect().top;
            const listBottom = this.refs.list.getBoundingClientRect().bottom;
            if (elemBottom > listBottom) {
                this.refs.selected.scrollIntoView(false);
            } else if (elemTop < listTop) {
                this.refs.selected.scrollIntoView(true);
            }
        }
        const anchor = this.props.page * this.props.perPage;
        const obj = this.props.options[anchor];
        if (obj) {
            const elm = document.getElementById(obj.id);
            if (elm) {
                elm.scrollIntoView(false);
            }
        }
    }

    setSelected(selected) {
        this.toSelect = selected;
    }

    handleArrowPress(e) {
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

    defaultOptionRenderer(option, isSelected, onAdd) {
        var rowSelected = '';
        if (isSelected) {
            rowSelected = 'more-modal__row--selected';
        }

        return (
            <div
                ref={isSelected ? 'selected' : option.value}
                className={rowSelected}
                key={'multiselectoption' + option.value}
                onClick={() => onAdd(option)}
            >
                {option.label}
            </div>
        );
    }

    handleScroll = () => {
        const threshold = (this.listScrollBar.current.getValues().scrollTop /
        this.listScrollBar.current.getScrollHeight()) * 100;
        if (threshold > 60 && !this.props.loading) {
            this.props.nextPage();
        }
    }

    render() {
        const {options} = this.props;

        if (this.props.loading && (options === null || options.length === 0) && this.props.page === 0) {
            return (
                <div>
                    <LoadingScreen
                        position='absolute'
                        key='loading'
                    />
                </div>
            );
        }
        if (options == null || options.length === 0) {
            return (
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
        }

        let renderer;
        if (this.props.optionRenderer) {
            renderer = this.props.optionRenderer;
        } else {
            renderer = this.defaultOptionRenderer;
        }

        const optionControls = options.map((o, i) => renderer(o, this.state.selected === i, this.props.onAdd));

        return (
            <div className='more-modal__list'>
                <Scrollbars
                    ref={this.listScrollBar}
                    onScroll={this.handleScroll}
                >
                    <div
                        ref='list'
                    >
                        {optionControls}
                    </div>
                </Scrollbars>
            </div>

        );
    }
}

MultiSelectList.defaultProps = {
    options: [],
    perPage: 50,
    onAction: () => null,
};

MultiSelectList.propTypes = {
    options: PropTypes.arrayOf(PropTypes.object),
    optionRenderer: PropTypes.func,
    page: PropTypes.number,
    perPage: PropTypes.number,
    onPageChange: PropTypes.func,
    onAdd: PropTypes.func,
    onSelect: PropTypes.func,
    loading: PropTypes.bool,
    nextPage: PropTypes.func,
};
