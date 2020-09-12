// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class ModalToggleButton extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            show: false,
        };
    }

    show = (e) => {
        if (e) {
            e.preventDefault();
        }
        this.setState({show: true});
    }

    hide = () => {
        this.setState({show: false});
    }

    render() {
        const {children, dialogType, dialogProps, onClick, isDisabled, id, ...props} = this.props;

        // allow callers to provide an onClick which will be called before the modal is shown
        let clickHandler = this.show;
        if (onClick) {
            clickHandler = (e) => {
                onClick();

                this.show(e);
            };
        }

        let dialog;
        if (this.state.show) {
            // this assumes that all modals will have an onHide event and will show when mounted
            dialog = React.createElement(dialogType, Object.assign({}, dialogProps, {
                onHide: () => {
                    this.hide();

                    if (dialogProps.onHide) {
                        dialogProps.onHide();
                    }
                },
            }));
        }

        // nesting the dialog in the anchor tag looks like it shouldn't work, but it does due to how react-bootstrap
        // renders modals at the top level of the DOM instead of where you specify in the virtual DOM
        return (
            <button
                {...props}
                className={'style--none ' + props.className}
                onClick={clickHandler}
                data-testid={id}
                disabled={isDisabled}
            >
                {children}
                {dialog}
            </button>
        );
    }
}

ModalToggleButton.propTypes = {
    children: PropTypes.node.isRequired,
    dialogType: PropTypes.any.isRequired,
    dialogProps: PropTypes.object,
    onClick: PropTypes.func,
    className: PropTypes.string,
    id: PropTypes.string,
    isDisabled: PropTypes.bool,
};

ModalToggleButton.defaultProps = {
    dialogProps: {},
    className: '',
};
