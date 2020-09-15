// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';
import {Unit} from '@formatjs/intl-relativetimeformat';
import moment from 'moment';

import {storiesOf} from '@storybook/react';
import {withKnobs, text} from '@storybook/addon-knobs';

import StoryGrid from 'storybook/story_grid';
import StoryBox from 'storybook/story_box';

import Timestamp from './index';

function* range(start: number, end: number): Iterable<number> {
    for (let i = start; start < end ? i <= end : i >= end; start < end ? i++ : i--) {
        yield i;
    }
}

const unitDiffs = new Map<Unit, Array<number>>([
    ['second', [-0, ...range(-1, -3), -57, -58, -59]],
    ['minute', [-0, ...range(-1, -3), -57, -58, -59]],
    ['hour', [-0, ...range(-1, -3), -12, -22, -23]],
    ['day', [-0, ...range(-1, -7), -14, ...range(-25, -31)]],
    ['week', [-0, ...range(-1, -4)]],
    ['month', [-0, ...range(-1, -3), ...range(-11, -13)]],
    ['quarter', [-0, ...range(-1, -5)]],
    ['year', [-0, ...range(-1, -3)]],
]);

const units = [...unitDiffs.keys()];

type Props = ComponentProps<typeof Timestamp>;

/* eslint-disable max-nested-callbacks */
storiesOf('Timestamp', module).
    addDecorator(withKnobs).
    add('absolute', () => {
        const value = text('value', new Date().toISOString());
        return (
            <StoryGrid>
                <StoryBox label='datetime'>
                    <Timestamp value={value}/>
                </StoryBox>
                <StoryBox label='date'>
                    <Timestamp
                        useTime={false}
                        value={value}
                    />
                </StoryBox>
                <StoryBox label='time'>
                    <Timestamp
                        useDate={false}
                        value={value}
                    />
                </StoryBox>
            </StoryGrid>
        );
    }).
    add('relative, auto unit', () => (
        <StoryGrid>
            {[
                ['rel=progressive', {

                } as Props],
                ['rel=progressive, date-only', {
                    useTime: false,
                } as Props],
                ['progressive, numeric', {
                    numeric: 'always',
                } as Props],
                ['0–45s = now, rel min-hr', {
                    units: [
                        'now',
                        'minute',
                        'hour',
                    ],
                } as Props],
                ['sec=now, rel min-hr, abs date-only', {
                    useTime: false,
                    units: [
                        'now',
                        'minute',
                        'hour',
                    ],
                } as Props],
            ].map(([label, props], boxIndex) => (
                <StoryBox
                    key={`kind-${boxIndex}`}
                    label={label}
                >
                    {[...unitDiffs].map(([unit, diffs], unitIndex) => (
                        <StoryBox
                            key={unit}
                        >
                            {diffs.map((diff) => (

                                <Timestamp
                                    key={`start-${diff}`}
                                    units={unitIndex === 0 ? units.slice(unitIndex, units.length) : units}
                                    value={moment().add(diff, unit).toDate()}
                                    {...props}
                                >
                                    {({formatted}, {relative}) => (
                                        <span key={`span-${diff}`}>
                                            <pre
                                                style={{
                                                    display: 'inline-grid',
                                                    marginRight: '2rem',
                                                    width: '15rem',
                                                    padding: '0px 5px',
                                                    textAlign: 'center',
                                                    borderColor: relative && relative.updateIntervalInSeconds != null ? 'green' : 'red',
                                                }}
                                            >
                                                {unit} {diff}
                                            </pre>
                                            {formatted}
                                        </span>
                                    )}
                                </Timestamp>
                            ))}
                        </StoryBox>
                    ))}
                </StoryBox>
            ))}
        </StoryGrid>
    )).
    add('relative, fixed unit', () => (
        <StoryGrid>
            {units.map((unit) => (
                <StoryBox
                    key={`fixed-box-${unit}`}
                    label={unit}
                >
                    {[-999, ...range(-12, -1), 0, ...range(1, 12), 999].map((diff) => (
                        <Timestamp
                            key={`fixed-time-${diff}`}
                            useTime={false}
                            unit={unit}
                            value={moment().add(diff, unit).toDate()}
                        />
                    ))}
                </StoryBox>
            ))}
        </StoryGrid>
    ));
