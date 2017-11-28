// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class ModalToggleButtonRedux extends React.Component {
    constructor(props) {
        super(props);

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);

        this.state = {
            show: false
        };
    }

    show(e) {
        if (e) {
            e.preventDefault();
        }

        this.setState({show: true});

        const {modalId, dialogProps, dialogType} = this.props;

        const modalData = {
            modalId,
            dialogProps,
            dialogType
        };

        this.props.actions.openModal(modalData);
    }

    hide() {
        this.setState({show: false});
        const {modalId} = this.props;

        this.props.actions.closeModal(modalId);
    }

    render() {
        const {children, onClick, modalId, dialogType, dialogProps, ...props} = this.props;

        // allow callers to provide an onClick which will be called before the modal is shown
        let clickHandler = this.show;
        if (onClick) {
            clickHandler = (e) => {
                onClick();

                this.show(e);
            };
        }

        // nesting the dialog in the anchor tag looks like it shouldn't work, but it does due to how react-bootstrap
        // renders modals at the top level of the DOM instead of where you specify in the virtual DOM
        return (
            <button
                {...props}
                className={'style--none ' + props.className}
                onClick={clickHandler}
            >
                {children}
            </button>
        );
    }
}

ModalToggleButtonRedux.propTypes = {
    children: PropTypes.node.isRequired,
    modalId: PropTypes.string.isRequired,
    dialogType: PropTypes.func.isRequired,
    dialogProps: PropTypes.object,
    onClick: PropTypes.func,
    className: PropTypes.string
};

ModalToggleButtonRedux.defaultProps = {
    dialogProps: {},
    className: ''
};
