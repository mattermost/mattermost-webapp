// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {intlShape} from 'react-intl';

export default class ModalToggleButtonRedux extends React.Component {
    static propTypes = {
        accessibilityLabel: PropTypes.string,
        children: PropTypes.node.isRequired,
        modalId: PropTypes.string.isRequired,
        dialogType: PropTypes.func.isRequired,
        dialogProps: PropTypes.object,
        onClick: PropTypes.func,
        className: PropTypes.string,
        actions: PropTypes.shape({
            openModal: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        dialogProps: {},
        className: '',
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    show(e) {
        if (e) {
            e.preventDefault();
        }

        const {modalId, dialogProps, dialogType} = this.props;

        const modalData = {
            modalId,
            dialogProps,
            dialogType,
        };

        this.props.actions.openModal(modalData);
    }

    render() {
        const {children, onClick, ...props} = this.props;
        const {formatMessage} = this.context.intl;
        const ariaLabel = `${props.accessibilityLabel} ${formatMessage({id: 'accessibility.button.dialog', defaultMessage: 'Dialog'})}`;

        // removing these three props since they are not valid props on buttons
        delete props.modalId;
        delete props.dialogType;
        delete props.dialogProps;
        delete props.accessibilityLabel;

        // allow callers to provide an onClick which will be called before the modal is shown
        let clickHandler = () => this.show();
        if (onClick) {
            clickHandler = (e) => {
                onClick();

                this.show(e);
            };
        }

        return (
            <button
                {...props}
                className={'style--none ' + props.className}
                data-toggle='modal toggle'
                aria-label={ariaLabel}
                onClick={clickHandler}
            >
                {children}
            </button>
        );
    }
}

