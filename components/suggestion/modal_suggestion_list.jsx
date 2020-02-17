// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import SuggestionList from 'components/suggestion/suggestion_list.jsx';
import {getClosestParent} from 'utils/utils.jsx';

export default class ModalSuggestionList extends React.PureComponent {
    static propTypes = {
        location: PropTypes.string.isRequired,
        open: PropTypes.bool.isRequired,
        cleared: PropTypes.bool.isRequired,
        inputRef: PropTypes.object.isRequired,
        onLoseVisibility: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            scroll: 0,
            modalBounds: {top: 0, bottom: 0},
            inputBounds: {top: 0, bottom: 0, width: 0},
            location: props.location,
        };

        this.container = React.createRef();
        this.suggestionList = React.createRef();
        this.latestHeight = 0;
    }

    calculateInputRect = () => {
        if (this.props.inputRef.current) {
            const rect = this.props.inputRef.current.getInput().getBoundingClientRect();
            return {top: rect.top, bottom: rect.bottom, width: rect.width};
        }
        return {top: 0, bottom: 0, width: 0};
    }

    onModalScroll = (e) => {
        if (this.state.scroll !== e.target.scrollTop &&
            this.latestHeight !== 0) {
            this.setState({scroll: e.target.scrollTop});
        }
    }

    componentDidMount() {
        if (this.container.current) {
            const modalBodyContainer = getClosestParent(this.container.current, '.modal-body');
            modalBodyContainer.addEventListener('scroll', this.onModalScroll);
        }
        window.addEventListener('resize', this.updateModalBounds);
    }

    componentWillUnmount() {
        if (this.container.current) {
            const modalBodyContainer = getClosestParent(this.container.current, '.modal-body');
            modalBodyContainer.removeEventListener('scroll', this.onModalScroll);
        }
        window.removeEventListener('resize', this.updateModalBounds);
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.props.open || this.props.cleared) {
            return;
        }

        if (prevProps.open !== this.state.open ||
            prevProps.cleared !== this.state.cleared ||
            prevState.scroll !== this.state.scroll ||
            prevState.modalBounds.top !== this.state.modalBounds.top ||
            prevState.modalBounds.bottom !== this.state.modalBounds.bottom) {
            const newInputBounds = this.updateInputBounds();
            this.updateLocation(newInputBounds);

            if (this.container.current) {
                const modalBodyRect = getClosestParent(this.container.current, '.modal-body').getBoundingClientRect();
                if ((newInputBounds.bottom < modalBodyRect.top) || (newInputBounds.top > modalBodyRect.bottom)) {
                    this.props.onLoseVisibility();
                    return;
                }
            }

            this.updateModalBounds();
        }
    }

    getChildHeight = () => {
        if (!this.container.current) {
            return 0;
        }

        const listElement = this.suggestionList.current.getContent()[0];
        if (!listElement) {
            return 0;
        }

        return listElement.getBoundingClientRect().height;
    }

    updateInputBounds = () => {
        const inputBounds = this.calculateInputRect();
        if (inputBounds.top !== this.state.inputBounds.top ||
            inputBounds.bottom !== this.state.inputBounds.bottom ||
            inputBounds.width !== this.state.inputBounds.width) {
            this.setState({inputBounds});
        }
        return inputBounds;
    }

    updateLocation = (newInputBounds) => {
        let inputBounds = newInputBounds;
        if (!newInputBounds) {
            inputBounds = this.state.inputBounds;
        }

        if (!this.container.current) {
            return;
        }

        this.latestHeight = this.getChildHeight();

        let newLocation = this.props.location;
        if (window.innerHeight < inputBounds.bottom + this.latestHeight) {
            newLocation = 'top';
        }
        if (inputBounds.top - this.latestHeight < 0) {
            newLocation = 'bottom';
        }

        if (this.state.location !== newLocation) {
            this.setState({location: newLocation});
        }
    }

    updateModalBounds = () => {
        if (!this.container.current) {
            return;
        }

        const modalContainer = getClosestParent(this.container.current, '.modal-content');
        const modalBounds = modalContainer.getBoundingClientRect();

        if (this.state.modalBounds.top !== modalBounds.top || this.state.modalBounds.bottom !== modalBounds.bottom) {
            this.setState({modalBounds: {top: modalBounds.top, bottom: modalBounds.bottom}});
        }
    }

    render() {
        const {
            ...props
        } = this.props;

        Reflect.deleteProperty(props, 'onLoseVisibility');

        let position = {};
        if (this.state.location === 'top') {
            position = {bottom: this.state.modalBounds.bottom - this.state.inputBounds.top};
        } else {
            position = {top: this.state.inputBounds.bottom - this.state.modalBounds.top};
        }

        return (
            <div
                style={{position: 'fixed', zIndex: 101, width: this.state.inputBounds.width, ...position}}
                ref={this.container}
            >
                <SuggestionList
                    {...props}
                    location={this.state.location}
                    ref={this.suggestionList}
                />
            </div>
        );
    }
}
