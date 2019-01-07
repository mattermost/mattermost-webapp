// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router-dom';
import classNames from 'classnames';
import {CSSTransition} from 'react-transition-group';

import * as GlobalActions from 'actions/global_actions.jsx';
import {Constants} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import MenuTutorialTip from 'components/tutorial/menu_tutorial_tip';

import MainMenu from 'components/main_menu';

const ANIMATION_DURATION = 500;

export default class SidebarRightMenu extends React.PureComponent {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        teamDisplayName: PropTypes.string,
        showTutorialTip: PropTypes.bool.isRequired,
        siteName: PropTypes.string,
        actions: PropTypes.shape({
            openRhsMenu: PropTypes.func.isRequired,
        }),
    };

    handleEmitUserLoggedOutEvent = () => {
        GlobalActions.emitUserLoggedOutEvent();
    }

    render() {
        var siteName = '';
        if (this.props.siteName != null) {
            siteName = this.props.siteName;
        }
        var teamDisplayName = siteName;
        if (this.props.teamDisplayName) {
            teamDisplayName = this.props.teamDisplayName;
        }

        let tutorialTip = null;
        if (this.props.showTutorialTip) {
            tutorialTip = <MenuTutorialTip onBottom={true}/>;
            this.props.actions.openRhsMenu();
        }

        return (
            <div
                className={classNames('sidebar--menu', {'move--left': this.props.isOpen && Utils.isMobile()})}
                id='sidebar-menu'
            >
                <div className='team__header theme'>
                    <Link
                        className='team__name'
                        to={`/channels/${Constants.DEFAULT_CHANNEL}`}
                    >
                        {teamDisplayName}
                    </Link>
                </div>

                <div className='nav-pills__container mobile-main-menu'>
                    {tutorialTip}
                    <CSSTransition
                        in={this.props.isOpen && Utils.isMobile()}
                        classNames='MobileRightSidebarMenu'
                        enter={true}
                        exit={true}
                        mountOnEnter={true}
                        unmountOnExit={true}
                        timeout={{
                            enter: ANIMATION_DURATION,
                            exit: ANIMATION_DURATION,
                        }}
                    >
                        <MainMenu mobile={true}/>
                    </CSSTransition>
                </div>
            </div>
        );
    }
}
