// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent, ReactNode} from 'react';
import {
    injectIntl,
    IntlShape,
    FormatDateOptions,
    FormatRelativeTimeOptions,
    FormattedMessage
} from 'react-intl';
import {isValidElementType} from 'react-is';
import {Unit} from '@formatjs/intl-relativetimeformat';
import moment from 'moment-timezone';

import {isSameYear, isWithin, isEqual, getDiff} from 'utils/datetime';
import {Resolvable, resolve} from 'utils/resolvable';
import {RequireOnlyOne} from 'utils/conditional_types';

import SemanticTime from './semantic_time';

// Feature test the browser for support of hourCycle.
// Note that Intl.DateTimeFormatOptions typings are stale and do not have definitions of hourCycle, dateStyle, etc..
// See https://github.com/microsoft/TypeScript/issues/34399
export const supportsHourCycle = Boolean(((new Intl.DateTimeFormat('en-US', {hour: 'numeric'})).resolvedOptions() as DateTimeOptions).hourCycle);

export type DateTimeOptions = FormatDateOptions & {hourCycle?: string};
export type RelativeOptions = FormatRelativeTimeOptions & {
    unit?: Unit;
    relNearest?: number;
    truncateEndpoints?: boolean;
    updateIntervalInSeconds?: number;
};
export type SimpleRelativeOptions = {
    message: ReactNode;
    updateIntervalInSeconds?: number;
}

const defaultRefreshIntervals = new Map<Unit, number /* seconds */>([
    ['hour', 60 * 5],
    ['minute', 15],
    ['second', 1],
]);

type FormatOptions = DateTimeOptions & RelativeOptions;

type UnitDescriptor = [Unit, number?, boolean?];

type Breakpoint = RequireOnlyOne<{
    within: UnitDescriptor;
    equals: UnitDescriptor;
}>
export type RangeDescriptor = Breakpoint & {
    display?: UnitDescriptor | ReactNode;
    updateIntervalInSeconds?: number;
};

export type ResolvedFormats = {
    relative: RelativeOptions | SimpleRelativeOptions | false;
    date: DateTimeOptions | false;
    time: DateTimeOptions | false;
}

type FormattedParts = {
    relative?: ReactNode;
    date?: ReactNode;
    time?: ReactNode;
}

export type Props = FormatOptions & {
    value?: string | number | Date;

    useRelative?: Resolvable<ResolvedFormats['relative'], {rawDate: Date}, FormatOptions>;
    ranges?: RangeDescriptor[];

    useDate?: Resolvable<Exclude<ResolvedFormats['date'], 'timeZone'> | false, {rawDate: Date}, FormatOptions>;
    useTime?: Resolvable<Exclude<ResolvedFormats['time'], 'timeZone' | 'hourCycle' | 'hour12'> | false, {rawDate: Date}, FormatOptions>;

    children?: Resolvable<ReactNode, {rawDate: Date} & FormattedParts, ResolvedFormats>;
    className?: string;
    label?: string;

    intl: IntlShape;
};

type State = {
    now: Date;
}

class Timestamp extends PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            now: new Date(),
        };
    }

    static defaultProps: Partial<Props> = {

        // relative
        numeric: 'auto',
        style: 'narrow',
        relNearest: 1,

        // fixed
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hourCycle: 'h12',
        timeZoneName: 'short',
    }

    nextUpdate: ReturnType<typeof setTimeout> | null = null;

    formatDynamic(rawDate: Date, {relative: relFormat, date: dateFormat, time: timeFormat}: ResolvedFormats): FormattedParts {
        try {
            let relative;
            let date;
            let time;

            if (relFormat) {
                const message = (relFormat as SimpleRelativeOptions).message;
                const unit = (relFormat as RelativeOptions).unit;

                if (message != null) {
                    relative = message;
                } else if (unit) {
                    const {relNearest, truncateEndpoints, ...format} = relFormat as RelativeOptions;
                    let diff;

                    if (relNearest === 0) {
                        diff = 0;
                    } else {
                        diff = getDiff(rawDate, this.state.now, unit, truncateEndpoints);
                        if (relNearest != null) {
                            diff = Math.round(diff / relNearest) * relNearest;
                        }
                    }

                    relative = this.props.intl.formatRelativeTime(diff, unit, format);

                    if (unit !== 'day' || !timeFormat) {
                        return {relative};
                    }
                }
            }

            if (relative == null && dateFormat) {
                date = this.format(rawDate, dateFormat);
            }

            if (timeFormat) {
                const {hourCycle, hour12} = this.props;
                time = this.format(rawDate, {hourCycle, hour12, ...timeFormat});
            }

            return {relative, date, time};
        } catch {
            const {timeZone, hourCycle, hour12} = this.props;
            return {
                date: dateFormat && Timestamp.formatMoment(rawDate, {timeZone, ...dateFormat}),
                time: timeFormat && Timestamp.formatMoment(rawDate, {timeZone, hourCycle, hour12, ...timeFormat})
            };
        }
    }

    format(rawDate: Date, format: DateTimeOptions): string {
        const {timeZone, intl: {locale}} = this.props;

        return (new Intl.DateTimeFormat(locale, {timeZone, ...format})).format(rawDate);
    }

    static formatMoment(rawDate: Date, {hour, minute, weekday, day, month, year, hourCycle, hour12, timeZone}: DateTimeOptions): string {
        const date = moment(rawDate);

        if (timeZone) {
            date.tz(timeZone);
        }

        if (hour && minute) {
            const useMilitaryTime = hourCycle === 'h23' || hourCycle === 'h24' || hour12 === false;
            return date.format(useMilitaryTime ? 'HH:mm' : 'h:mm A');
        } else if (day && month) {
            return date.format(year ? 'MMMM D, YYYY' : 'MMMM D');
        } else if (weekday) {
            return date.format('dddd');
        }
        return date.format('dddd, MMMM D, YYYY');
    }

    autoRange(rawDate: Date, ranges: Props['ranges'] = this.props.ranges): Partial<RangeDescriptor> {
        return ranges?.find(({equals, within}: Breakpoint) => {
            if (equals != null) {
                return isEqual(rawDate, this.state.now, ...equals);
            }
            if (within != null) {
                return isWithin(rawDate, this.state.now, ...within);
            }
            return false;
        }) ?? {
            display: [this.props.unit],
            updateIntervalInSeconds: this.props.updateIntervalInSeconds
        } as RangeDescriptor;
    }

    private getFormats(rawDate: Date): ResolvedFormats {
        const {
            numeric,
            style,
            useRelative = (): ResolvedFormats['relative'] => {
                const {
                    display,
                    updateIntervalInSeconds,
                } = this.autoRange(rawDate);

                if (display) {
                    if (isValidElementType(display) || !Array.isArray(display)) {
                        return {
                            message: display,
                            updateIntervalInSeconds,
                        } as SimpleRelativeOptions;
                    }

                    const [
                        unit,
                        relNearest = this.props.relNearest,
                        truncateEndpoints = this.props.truncateEndpoints,
                    ] = display as UnitDescriptor;

                    if (unit) {
                        return {
                            unit,
                            relNearest,
                            truncateEndpoints,
                            numeric,
                            style,
                            updateIntervalInSeconds: updateIntervalInSeconds ?? defaultRefreshIntervals.get(unit),
                        } as RelativeOptions;
                    }
                }

                return false;
            },
            year,
            month,
            day,
            weekday,
            hour,
            minute,
            useDate = (): ResolvedFormats['date'] => {
                if (isWithin(rawDate, this.state.now, 'day', -6)) {
                    return {weekday};
                }
                if (isSameYear(rawDate)) {
                    return {day, month};
                }

                return {year, month, day};
            },
            useTime = {hour, minute},
        } = this.props;

        const relative = resolve(useRelative, {rawDate}, this.props);
        const date = !relative && resolve(useDate, {rawDate}, this.props);
        const time = resolve(useTime, {rawDate}, this.props);

        return {relative, date, time};
    }

    componentWillUnmount() {
        if (this.nextUpdate) {
            clearTimeout(this.nextUpdate);
            this.nextUpdate = null;
        }
    }

    private maybeUpdate(relative: ResolvedFormats['relative']): ReturnType<typeof setTimeout> | null {
        if (!relative ||
            !relative.updateIntervalInSeconds) {
            return null;
        }
        return setTimeout(() => this.setState({now: new Date()}), relative.updateIntervalInSeconds * 1000);
    }

    render() {
        const {
            value = this.state.now,
            children,
            className
        } = this.props;

        const rawDate = new Date(value);
        const formats = this.getFormats(rawDate);
        const {relative, date, time} = this.formatDynamic(rawDate, formats);

        this.nextUpdate = this.maybeUpdate(formats.relative);

        if (children) {
            return resolve(children, {rawDate, relative, date, time}, formats);
        }

        return (
            <SemanticTime
                value={rawDate}
                className={className}
            >
                {(relative || date) && time ?
                    <FormattedMessage
                        id='timestamp.datetime'
                        defaultMessage='{relativeOrDate} at {time}'
                        values={{
                            relativeOrDate: relative ?? date,
                            time,
                        }}
                    /> :
                    relative ?? date ?? time
                }
            </SemanticTime>
        );
    }
}

export default injectIntl(Timestamp);
