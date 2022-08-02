// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {CSSTransition} from 'react-transition-group';

import {Animations, AnimationReason, mapAnimationReasonToClass} from './steps';

import PersonWaveSVG from './person-wave.svg';
import PersonSmileSVG from './person-smile.svg';
import PersonElbowSVG from './person-elbow.svg';

import './team_members.scss';

type Props = {
    transitionDirection: AnimationReason;
    show: boolean;
}

const TeamMembers = (props: Props) => {
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('TeamMembers', props.transitionDirection)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className='TeamMembers-body'>
                <PersonWaveSVG className={'wave'}/>
                <PersonSmileSVG className={'smile'}/>
                <PersonElbowSVG className={'elbow'}/>
            </div>
        </CSSTransition>
    );
};

export default TeamMembers;
