// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import OverlayTrigger from 'components/overlay_trigger';


// import ArrowRightIcon from 'components/widgets/icons/arrow_right_icon';
import Constants, {Locations, A11yCustomEventTypes} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';
import {t} from 'utils/i18n';

export default class SharedMessage extends React.PureComponent { // TODO
    static propTypes = {
        location: PropTypes.oneOf([Locations.CENTER, Locations.RHS_ROOT, Locations.RHS_COMMENT, Locations.SEARCH]).isRequired,
        postId: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            // flagPost: PropTypes.func.isRequired,
            // unflagPost: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        location: Locations.CENTER,
    };

    constructor() {
        super();

        this.buttonRef = React.createRef();

        this.state = {
            a11yActive: false,
        };
    }

    componentDidMount() {
        if (this.buttonRef.current) {
            this.buttonRef.current.addEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            this.buttonRef.current.addEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
        }
    }
    componentWillUnmount() {
        if (this.buttonRef.current) {
            this.buttonRef.current.removeEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            this.buttonRef.current.removeEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
        }
    }

    componentDidUpdate() {
        if (this.state.a11yActive && this.buttonRef.current) {
            this.buttonRef.current.dispatchEvent(new Event(A11yCustomEventTypes.UPDATE));
        }
    }

    handlePress = (e) => {
        e.preventDefault();

        const {
            actions,
            postId,
        } = this.props;

        //show modal
    }

    handleA11yActivateEvent = () => {
        this.setState({a11yActive: true});
    }

    handleA11yDeactivateEvent = () => {
        this.setState({a11yActive: false});
    }

    render() {

        return (
            <OverlayTrigger
                className='hidden-xs'
                key={`sharetooltipkey`}
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                overlay={
                    <Tooltip
                        id='shareTooltip'
                        className='hidden-xs'
                    >
                        <FormattedMessage
                            id={'shared_message'}
                            defaultMessage={'Share message'}
                        />
                    </Tooltip>
                }
            >
                <button
                    ref={this.buttonRef}
                    id={`${this.props.location}_shareIcon_${this.props.postId}`}
                    aria-label={localizeMessage('flag_post.unflag', 'Remove from Saved').toLowerCase()}
                    className='post-menu__item'
                    onClick={this.handlePress}
                >
                    <i className='icon icon-arrow-right-bold-outline'/>
                </button>
            </OverlayTrigger>
        );
    }
}
