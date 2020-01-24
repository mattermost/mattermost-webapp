// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

import SuggestionList from 'components/suggestion/suggestion_list.jsx';

export default class ModalSuggestionList extends React.PureComponent {
    static propTypes = {
        modalBounds: PropTypes.shape({
            top: PropTypes.number.isRequired,
            bottom: PropTypes.number.isRequired,
        }).isRequired,
        calculateInputRect: PropTypes.func.isRequired,
        blur: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            scroll: 0,
            location: props.location,
        };

        this.container = React.createRef();
    }

    onModalScroll = () => {
        const modalBodyContainer = ReactDOM.findDOMNode(this.container.current).parentElement.parentElement.parentElement.parentElement.parentElement;
        if (this.state.scroll !== modalBodyContainer.scrollTop) {
            this.setState({scroll: modalBodyContainer.scrollTop});
        }
    }

    componentDidMount() {
        if (this.container.current) {
            const modalBodyContainer = ReactDOM.findDOMNode(this.container.current).parentElement.parentElement.parentElement.parentElement.parentElement;
            modalBodyContainer.addEventListener('scroll', this.onModalScroll);
        }
    }

    componentWillUnmount() {
        if (this.container.current) {
            const modalBodyContainer = ReactDOM.findDOMNode(this.container.current).parentElement.parentElement.parentElement.parentElement.parentElement;
            modalBodyContainer.removeEventListener('scroll', this.onModalScroll);
        }
    }

    componentWillUpdate() {
        this.inputBounds = this.props.calculateInputRect();

        if (this.container.current) {
            const container = ReactDOM.findDOMNode(this.container.current);
            const modalBodyRect = container.parentElement.parentElement.parentElement.parentElement.parentElement.getBoundingClientRect();
            if ((this.inputBounds.bottom < modalBodyRect.top) || (this.inputBounds.top > modalBodyRect.bottom)) {
                this.props.blur();
                return;
            }

            const listElement = container.firstElementChild;
            if (listElement) {
                const rect = listElement.getBoundingClientRect();
                if (rect.height !== 0) {
                    this.latestHeight = rect.height;
                }
            }

            let newLocation = 'bottom';
            if (window.innerHeight < this.inputBounds.bottom + this.latestHeight) {
                newLocation = 'top';
            }
            if (newLocation !== this.state.location) {
                this.setState({location: newLocation});
            }
        }
    }

    inputBounds = {top: 0, bottom: 0, width: 0};
    latestHeight = 0;

    render() {
        const {
            modalBounds,
            ...props
        } = this.props;

        let position = {};
        if (this.state.location === 'top') {
            position = {bottom: (modalBounds.bottom - this.inputBounds.top)};
        } else {
            position = {top: this.inputBounds.bottom - modalBounds.top};
        }
        return (
            <div
                style={{position: 'fixed', zIndex: 101, width: this.inputBounds.width, ...position}}
                ref={this.container}
            >
                <SuggestionList
                    {...{...props, location: this.state.location}}
                />
            </div>
        );
    }
}