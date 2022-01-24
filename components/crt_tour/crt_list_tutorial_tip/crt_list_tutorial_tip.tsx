// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useDispatch, useSelector} from 'react-redux';

import {GlobalState} from 'types/store';
import {open as openLhs} from 'actions/views/lhs.js';
import {getIsMobileView} from 'selectors/views/browser';
import {Constants, Preferences} from 'utils/constants';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import TutorialTip from 'components/tutorial/tutorial_tip';
import {ShortcutKey, ShortcutKeyVariant} from 'components/shortcut_key';
import {useMeasurePunchouts} from 'components/tutorial_tour_tip/hooks';

type Props = {
    autoTour: boolean;
};

export const UpShortcut = () => <ShortcutKey variant={ShortcutKeyVariant.TutorialTip}>{'UP'}</ShortcutKey>;

export const DownShortcut = () => <ShortcutKey variant={ShortcutKeyVariant.TutorialTip}>{'DOWN'}</ShortcutKey>;

const CRTListTutorialTip = ({autoTour}: Props) => {
    const isMobileView = useSelector((state: GlobalState) => getIsMobileView(state));
    const dispatch = useDispatch();
    const onPrevNavigateTo = () => dispatch(openLhs());

    const title = (
        <FormattedMessage
            id='tutorial_threads.list.title'
            defaultMessage={'Threads List'}
        />
    );

    const screen = (
        <>
            <p>
                <FormattedMarkdownMessage
                    id='tutorial_threads.list.description-p1'
                    defaultMessage={'Here you’ll see a preview of all threads you’re following or participating in. Clicking on a thread in this list will open the full thread on the right.'}
                />
            </p>
            <p>
                <FormattedMessage
                    id='tutorial_threads.list.description-p2'
                    defaultMessage={'Use {upKey} / {downKey} to navigate the thread list.'}
                    values={{
                        upKey: <UpShortcut/>,
                        downKey: <DownShortcut/>,
                    }}
                />
            </p>
        </>
    );

    const punchOutIds = isMobileView ? ['tutorial-threads-mobile-list', 'tutorial-threads-mobile-header'] : ['threads-list-container'];

    return (
        <TutorialTip
            title={title}
            placement='right'
            showOptOut={false}
            step={Constants.CrtTutorialSteps.LIST_POPOVER}
            tutorialCategory={Preferences.CRT_TUTORIAL_STEP}
            stopPropagation={true}
            screen={screen}
            overlayClass='tip-overlay--threads-list'
            autoTour={autoTour}
            onPrevNavigateTo={onPrevNavigateTo}
            punchOut={useMeasurePunchouts(punchOutIds, [])}
        />
    );
};

export default CRTListTutorialTip;
