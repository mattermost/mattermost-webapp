// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import moment from 'moment-timezone';
import {Unit} from '@formatjs/intl-relativetimeformat';

import {storiesOf} from '@storybook/react';
import {withKnobs, boolean, number, select, text} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';

import StoryGrid from 'storybook/story_grid';
import StoryBox from 'storybook/story_box';

import ThreadItem from './thread_item';
import ThreadList from './thread_list';

const units: Unit[] = [
    'second',
    'minute',
    'hour',
    'day',
    'week',
    'month',
    'quarter',
    'year',
];

const users = [
    {
        url: './api/v4/users/1/image?_=0',
        username: 'jesus.espino',
        name: 'Jesus Espino',
    },
    {
        url: './api/v4/users/2/image?_=0',
        username: 'johnny.depp',
        name: 'Johnny Depp',
    },
    {
        url: './api/v4/users/3/image?_=0',
        username: 'bilbo.baggins',
        name: 'Bilbo Baggins',
    },
    {
        url: './api/v4/users/4/image?_=0',
        username: 'michael.hall',
        name: 'Anthony Michael Hall',
    },
    {
        url: './api/v4/users/5/image?_=0',
        username: 'kathy.baker',
        name: 'Kathy Baker',
    },
    {
        url: './api/v4/users/6/image?_=0',
        username: 'vincent.price',
        name: 'Vincent Price',
    },
    {
        url: './api/v4/users/7/image?_=0',
        username: 'alan.arkin',
        name: 'Alan Arkin',
    },
];

storiesOf('Features/Threading/Global Threads', module).
    addDecorator(withKnobs).
    add('ThreadItem', () => (
        <StoryGrid>
            <StoryBox>
                <ThreadItem
                    name={text('team', users[0].name)}
                    teamName={text('teamName', 'Enterprise Team')}
                    previewText='Do we have a guideline for what minimum width we should support in the system console? Do we have a guideline for what minimum width we should support in the system console? Do we have a guideline for what minimum width we should support in the system console?'

                    participants={users.slice(0, number('number of participants', 7))}
                    totalReplies={number('total replies', 8)}
                    newReplies={number('new/unread replies', 3)}
                    newMentions={number('new/unread mentions', 1)}
                    lastReplyAt={moment().add(select('unit', units, 'second'), number('diff', 0)).toDate()}

                    isFollowing={boolean('is following', true)}
                    isSaved={boolean('is saved', false)}
                    isSelected={boolean('is selected', false)}

                    actions={{
                        select: action('select'),
                        follow: action('follow'),
                        unfollow: action('unfollow'),
                        openInChannel: action('open in channel'),
                        markRead: action('mark as read'),
                        markUnread: action('mark as unread'),
                        save: action('save'),
                        unsave: action('unsave'),
                        copyLink: action('copy link'),
                    }}
                />
            </StoryBox>
        </StoryGrid>
    )).
    add('ThreadList', () => {
        const post = (
            <ThreadItem
                name={text('team', users[0].name)}
                teamName={text('teamName', 'Enterprise Team')}
                previewText='Do we have a guideline for what minimum width we should support in the system console? Do we have a guideline for what minimum width we should support in the system console? Do we have a guideline for what minimum width we should support in the system console?'

                participants={users.slice(0, number('number of participants', 7))}
                totalReplies={number('total replies', 8)}
                newReplies={number('new/unread replies', 3)}
                newMentions={number('new/unread mentions', 1)}
                lastReplyAt={moment().add(select('unit', units, 'minute'), number('diff', -5)).toDate()}

                isFollowing={boolean('is following', true)}
                isSaved={boolean('is saved', false)}
                isSelected={boolean('is selected', false)}

                actions={{
                    select: action('select'),
                    follow: action('follow'),
                    unfollow: action('unfollow'),
                    openInChannel: action('open in channel'),
                    markRead: action('mark as read'),
                    markUnread: action('mark as unread'),
                    save: action('save'),
                    unsave: action('unsave'),
                    copyLink: action('copy link'),
                }}
            />
        );

        return (
            <StoryGrid>
                <StoryBox containerStyle={{width: 500}}>
                    <ThreadList
                        posts={
                            <>
                                {React.cloneElement(post)}
                                {React.cloneElement(post)}
                                {React.cloneElement(post)}
                                {React.cloneElement(post)}
                                {React.cloneElement(post)}
                                {React.cloneElement(post)}
                                {React.cloneElement(post)}
                            </>
                        }
                    />
                </StoryBox>
            </StoryGrid>
        );
    });
