// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {ModalData} from 'types/actions';

import { ModalIdentifiers } from 'utils/constants';

import OverlayTrigger from 'components/overlay_trigger';

import Constants, {Locations, A11yCustomEventTypes} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';
import {t} from 'utils/i18n';
import { Post } from 'mattermost-redux/types/posts';
import ShareMessageModal from 'components/share_message_modal';
import AddUserToChannelModal from 'components/add_user_to_channel_modal/';

type Props = {
        post: Post;
        location?: 'RHS'; //
        postId: string,
        actions: {
            openModal: <P>(modalData: ModalData<P>) => void;
            // closeModal: (modalId: string) => void;
            // /**
            //  * Function flag the post
            //  */
            // flagPost: (postId: string) => void;

            // /**
            //  * Function to unflag the post
            //  */
            // unflagPost: (postId: string) => void;
        },
}

type State = {
    /* */
}

/*TODO remove note: modelled after dot_menu.tsx*/
export default class SharedMessage extends React.PureComponent<Props, State> { // TODO


    public static defaultProps: Partial<Props> = {
        // location: Locations.CENTER,
    }

    private buttonRef: React.RefObject<HTMLButtonElement>;

    constructor(props: Props) {
        super(props);

        this.state = {
            // a11yActive: false,
        };

        this.buttonRef = React.createRef<HTMLButtonElement>();

        
    }

    // componentDidMount() {
    //     if (this.buttonRef.current) {
    //         this.buttonRef.current.addEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
    //         this.buttonRef.current.addEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
    //     }
    // }
    // componentWillUnmount() {
    //     if (this.buttonRef.current) {
    //         this.buttonRef.current.removeEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
    //         this.buttonRef.current.removeEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
    //     }
    // }

    // componentDidUpdate() {
        // if (this.state.a11yActive && this.buttonRef.current) {
        //     this.buttonRef.current.dispatchEvent(new Event(A11yCustomEventTypes.UPDATE));
        // }
    // }

    /* channel_navigator.tsx */
    openQuickSwitcher = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        // trackEvent('ui', 'ui_sidebar_open_channel_switcher_v2');

        console.log("opening modal:");

        this.props.actions.openModal({
            modalId: ModalIdentifiers.SHARE_MESSAGE_MODAL,
            dialogType: ShareMessageModal,
            dialogProps: {post: this.props.post}
        });

        console.log("attempted open");
    }

    // handleA11yActivateEvent = () => {
    //     this.setState({a11yActive: true});
    // }

    // handleA11yDeactivateEvent = () => {
    //     this.setState({a11yActive: false});
    // }

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
                    aria-label={localizeMessage('shared_message.tooltip', 'Share message').toLowerCase()}
                    className='post-menu__item'
                    onClick={this.openQuickSwitcher}
                >
                    <i className='icon icon-arrow-right-bold-outline'/>
                </button>
            </OverlayTrigger>
        );
    }
}
