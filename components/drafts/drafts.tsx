// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useIntl} from 'react-intl';

import {UserProfile, UserStatus} from 'mattermost-redux/types/users';
import {selectChannel} from 'mattermost-redux/actions/channels';

import {getGlobalHeaderEnabled} from 'selectors/global_header';
import {Draft} from 'selectors/drafts';

import NoResultsIndicator from 'components/no_results_indicator';
import Header from 'components/widgets/header';
import RHSSearchNav from 'components/rhs_search_nav';

import DraftRow from './draft_row';
import DraftsIllustration from './drafts_illustration';

import './drafts.scss';

type Props = {
    drafts: Draft[];
    user: UserProfile;
    displayName: string;
    status: UserStatus['status'];
}

function Drafts({
    displayName,
    drafts,
    status,
    user,
}: Props) {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const globalHeaderEnabled = useSelector(getGlobalHeaderEnabled);

    useEffect(() => {
        dispatch(selectChannel(''));
    }, []);

    return (
        <div
            id='app-content'
            className='Drafts app__content'
        >
            <Header
                level={2}
                className='Drafts__header'
                heading={formatMessage({
                    id: 'drafts.heading',
                    defaultMessage: 'Drafts',
                })}
                subtitle={formatMessage({
                    id: 'drafts.subtitle',
                    defaultMessage: 'All messages you\'ve started will show here',
                })}
                right={globalHeaderEnabled ? null : <RHSSearchNav/>}
            />
            <main className='Drafts__main'>
                {drafts.map((d) => (
                    <DraftRow
                        key={d.key}
                        displayName={displayName}
                        draft={d}
                        user={user}
                        status={status}
                    />
                ))}
                {drafts.length === 0 && (
                    <NoResultsIndicator
                        expanded={true}
                        iconGraphic={DraftsIllustration}
                        title={formatMessage({
                            id: 'drafts.empty.title',
                            defaultMessage: 'No drafts at the moment',
                        })}
                        subtitle={formatMessage({
                            id: 'drafts.empty.subtitle',
                            defaultMessage: 'Any messages you’ve started will show here.',
                        })}
                    />
                )}
            </main>
        </div>
    );
}

export default memo(Drafts);
