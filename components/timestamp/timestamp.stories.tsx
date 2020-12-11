// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';
import {Unit} from '@formatjs/intl-relativetimeformat';
import moment from 'moment';

import {storiesOf} from '@storybook/react';
import {withKnobs, date, boolean, optionsKnob} from '@storybook/addon-knobs';

import StoryGrid from 'storybook/story_grid';
import StoryBox from 'storybook/story_box';

import {STANDARD_UNITS} from './relative_ranges';

import Timestamp from './index';

function* range(start: number, end: number): Iterable<number> {
    for (let i = start; start < end ? i <= end : i >= end; start < end ? i++ : i--) {
        yield i;
    }
}

const unitDiffs = new Map<Unit, Array<number>>([
    ['second', [...range(-1, -3), -57, -58, -59]],
    ['minute', [...range(-1, -3), -57, -58, -59]],
    ['hour', [...range(-1, -3), -12, -22, -23]],
    ['day', [...range(-1, -7), -14, -22]],
    ['week', [...range(-1, -4)]],
    ['month', [...range(-1, -3), ...range(-11, -13)]],
    ['quarter', [...range(-1, -5)]],
    ['year', [...range(-1, -3)]],
]);

const units = [...unitDiffs.keys()];

type Props = ComponentProps<typeof Timestamp>;

/* eslint-disable max-nested-callbacks */
storiesOf('Connected/Timestamp', module).
    addDecorator(withKnobs).
    add('interactive', () => {
        const props: Props = {
            value: date('value'),
            units: optionsKnob<string[]>(
                'auto relative units (ordered)',
                Object.keys(STANDARD_UNITS).reduce((opts: Record<string, any>, opt: string) => {
                    opts[opt] = opt;
                    return opts;
                }, {}),
                ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'],
                {display: 'multi-select'},
            ),
            userTimezone: {
                useAutomaticTimezone: true,
                automaticTimezone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
                manualTimezone: 'Etc/UTC',
            },
        };

        if (!boolean('show date?', true)) {
            props.useDate = false;
        }

        if (!boolean('show time?', true)) {
            props.useTime = false;
        } else if (boolean('show timeZone name?', true)) {
            props.useTime = {hour: 'numeric', minute: 'numeric', timeZoneName: 'short'};
        }

        if (!boolean('use auto timeZone', true)) {
            props.userTimezone!.useAutomaticTimezone = false;

            props.userTimezone!.manualTimezone = optionsKnob(
                'manual timeZone',
                moment.tz.names().reduce((opts: Record<string, any>, opt: string) => {
                    opts[opt] = opt;
                    return opts;
                }, {}),
                'Etc/UTC',
                {display: 'select'},
            );
        }

        return (
            <StoryGrid>
                <StoryBox>
                    <Timestamp {...props}/>
                </StoryBox>
            </StoryGrid>
        );
    }).
    add('relative, auto unit', () => {
        const propVariations: [string, Props][] = [
            ['rel=progressive', {} as Props],
            ['rel=progressive, date-only', {useTime: false} as Props],
            ['rel=progressive, numeric', {numeric: 'always'} as Props],
        ];
        return (
            <StoryGrid>
                {propVariations.map(([label, props], boxIndex) => (
                    <StoryBox
                        key={`kind-${boxIndex}`}
                        label={label}
                    >
                        {[...unitDiffs].map(([unit, diffs], unitIndex) => (
                            <StoryBox
                                key={unit}
                                label={unit}
                            >
                                <Timestamp
                                    key={`start-${0}`}
                                    {...props}
                                    units={units.slice(unitIndex, units.length)}
                                    value={moment().toDate()}
                                >
                                    {({formatted}, {relative}) => (
                                        <span>
                                            <pre
                                                style={{
                                                    display: 'inline-grid',
                                                    marginRight: '2rem',
                                                    width: '4rem',
                                                    padding: '0px 5px',
                                                    textAlign: 'center',
                                                    borderColor: relative && relative.updateIntervalInSeconds != null ? 'green' : 'red',
                                                }}
                                            >
                                                {0}
                                            </pre>
                                            {formatted}
                                        </span>
                                    )}
                                </Timestamp>

                                {diffs.map((diff) => (
                                    <Timestamp
                                        key={`start-${diff}`}
                                        units={units}
                                        {...props}
                                        value={moment().add(diff, unit).toDate()}
                                    >
                                        {({formatted}, {relative}) => (
                                            <span key={`span-${diff}`}>
                                                <pre
                                                    style={{
                                                        display: 'inline-grid',
                                                        marginRight: '2rem',
                                                        width: '4rem',
                                                        padding: '0px 5px',
                                                        textAlign: 'center',
                                                        borderColor: relative && relative.updateIntervalInSeconds != null ? 'green' : 'red',
                                                    }}
                                                >
                                                    {diff}
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
        );
    }).
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
