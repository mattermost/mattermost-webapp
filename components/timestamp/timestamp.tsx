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
import moment, {Moment} from 'moment-timezone';

import {isSameYear, isWithin, isEqual, getDiff} from 'utils/datetime';
import {Resolvable, resolve} from 'utils/resolvable';
import {RequireOnlyOne} from 'utils/conditional_types';

import SemanticTime from './semantic_time';

// Feature test the browser for support of hourCycle.
// Note that Intl.DateTimeFormatOptions typings are stale and do not have definitions of hourCycle, dateStyle, etc..
// See https://github.com/microsoft/TypeScript/issues/34399
export const supportsHourCycle = Boolean(((new Intl.DateTimeFormat('en-US', {hour: 'numeric'})).resolvedOptions() as DateTimeOptions).hourCycle);

function is12HourTime(hourCycle: DateTimeOptions['hourCycle']) {
    return !(hourCycle === 'h23' || hourCycle === 'h24');
}

export type DateTimeOptions = FormatDateOptions & {
    hourCycle?: string;
};

export type RelativeOptions = FormatRelativeTimeOptions & {
    unit: Unit;
    relNearest?: number;
    truncateEndpoints?: boolean;
    updateIntervalInSeconds?: number;
};
function isRelative(format: ResolvedFormats['relative']): format is RelativeOptions {
    return Boolean((format as RelativeOptions)?.unit);
}

export type SimpleRelativeOptions = {
    message: ReactNode;
    updateIntervalInSeconds?: number;
}
function isSimpleRelative(format: ResolvedFormats['relative']): format is SimpleRelativeOptions {
    return Boolean((format as SimpleRelativeOptions)?.message);
}

const defaultRefreshIntervals = new Map<Unit, number /* seconds */>([
    ['hour', 60 * 5],
    ['minute', 15],
    ['second', 1],
]);

type FormatOptions = DateTimeOptions & Partial<RelativeOptions>;

type UnitDescriptor = [Unit, number?, boolean?];

type Breakpoint = RequireOnlyOne<{
    within: UnitDescriptor;
    equals: UnitDescriptor;
}>;

type DisplayAs = {
    display: UnitDescriptor | ReactNode;
    updateIntervalInSeconds?: number;
};

export type RangeDescriptor = Breakpoint & DisplayAs;

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

    useRelative?: Resolvable<ResolvedFormats['relative'], {value: Date}, FormatOptions>;
    ranges?: RangeDescriptor[];

    useDate?: Resolvable<Exclude<ResolvedFormats['date'], 'timeZone'> | false, {value: Date}, FormatOptions>;
    useTime?: Resolvable<Exclude<ResolvedFormats['time'], 'timeZone' | 'hourCycle' | 'hour12'> | false, {value: Date}, FormatOptions>;

    children?: Resolvable<ReactNode, {value: Date; formatted: ReactNode} & FormattedParts, ResolvedFormats>;
    className?: string;
    label?: string;
    useSemanticOutput?: boolean;

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

    formatParts(value: Date, {relative: relFormat, date: dateFormat, time: timeFormat}: ResolvedFormats): FormattedParts {
        try {
            let relative: FormattedParts['relative'];
            let date: FormattedParts['date'];
            let time: FormattedParts['time'];

            if (isSimpleRelative(relFormat)) {
                relative = relFormat.message;
            } else if (isRelative(relFormat)) {
                relative = this.formatRelative(value, relFormat);

                if (relFormat.unit !== 'day' || !timeFormat) {
                    return {relative};
                }
            }

            if (relative == null && dateFormat) {
                date = this.formatDateTime(value, dateFormat);
            }

            if (timeFormat) {
                const {hourCycle, hour12 = supportsHourCycle ? undefined : is12HourTime(hourCycle)} = this.props;

                time = this.formatDateTime(value, {hourCycle, hour12, ...timeFormat});
            }

            return {relative, date, time};
        } catch {
            // fallback to moment for unsupported timezones
            const {timeZone, hourCycle, hour12} = this.props;

            const momentValue = moment.utc(value.getTime());

            if (timeZone) {
                momentValue.tz(timeZone);
            }

            return {
                date: dateFormat && Timestamp.momentDate(momentValue, {...dateFormat}),
                time: timeFormat && Timestamp.momentTime(momentValue, {hourCycle, hour12, ...timeFormat})
            };
        }
    }

    formatRelative(value: Date, relFormat: ResolvedFormats['relative']): string {
        const {unit, relNearest, truncateEndpoints, ...format} = relFormat as RelativeOptions;
        let diff: number;

        if (relNearest === 0) {
            diff = 0;
        } else {
            diff = getDiff(value, this.state.now, this.props.timeZone, unit, truncateEndpoints);
            if (relNearest != null) {
                diff = Math.round(diff / relNearest) * relNearest;
            }
        }

        return this.props.intl.formatRelativeTime(diff, unit, format);
    }

    formatDateTime(value: Date, format: DateTimeOptions): string {
        const {timeZone, intl: {locale}} = this.props;

        return (new Intl.DateTimeFormat(locale, {timeZone, ...format})).format(value);
    }

    static momentTime(value: Moment, {hour, minute, hourCycle, hour12}: DateTimeOptions): string | undefined {
        if (hour && minute) {
            const useMilitaryTime = (!is12HourTime(hourCycle) && hour12 == null) || hour12 === false;
            return value.format(useMilitaryTime ? 'HH:mm' : 'h:mm A');
        }
        return undefined;
    }

    static momentDate(value: Moment, {weekday, day, month, year}: DateTimeOptions): string | undefined {
        if (weekday && day && month && year) {
            return value.format('dddd, MMMM DD, YYYY');
        } else if (day && month && year) {
            return value.format('MMMM DD, YYYY');
        } else if (day && month) {
            return value.format('MMMM DD');
        } else if (weekday) {
            return value.format('dddd');
        }
        return undefined;
    }

    autoRange(value: Date, ranges: Props['ranges'] = this.props.ranges): DisplayAs {
        return ranges?.find(({equals, within}: Breakpoint) => {
            if (equals != null) {
                return isEqual(value, this.state.now, this.props.timeZone, ...equals);
            }
            if (within != null) {
                return isWithin(value, this.state.now, this.props.timeZone, ...within);
            }
            return false;
        }) ?? {
            display: [this.props.unit],
            updateIntervalInSeconds: this.props.updateIntervalInSeconds
        };
    }

    private getFormats(value: Date): ResolvedFormats {
        const {
            numeric,
            style,
            useRelative = (): ResolvedFormats['relative'] => {
                const {
                    display,
                    updateIntervalInSeconds,
                } = this.autoRange(value);

                if (display) {
                    if (isValidElementType(display) || !Array.isArray(display)) {
                        return {
                            message: display,
                            updateIntervalInSeconds,
                        };
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
                        };
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
            timeZone,
            useDate = (): ResolvedFormats['date'] => {
                if (isWithin(value, this.state.now, timeZone, 'day', -6)) {
                    return {weekday};
                }
                if (isSameYear(value)) {
                    return {day, month};
                }

                return {year, month, day};
            },
            useTime = {hour, minute},
        } = this.props;

        const relative = resolve(useRelative, {value}, this.props);
        const date = !relative && resolve(useDate, {value}, this.props);
        const time = resolve(useTime, {value}, this.props);

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

    static format({relative, date, time}: FormattedParts): ReactNode {
        return (relative || date) && time ? (
            <FormattedMessage
                id='timestamp.datetime'
                defaultMessage='{relativeOrDate} at {time}'
                values={{
                    relativeOrDate: relative || date,
                    time,
                }}
            />
        ) : relative || date || time;
    }

    static formatLabel(value: Date, timeZone?: string) {
        const momentValue = moment(value);

        if (timeZone) {
            momentValue.tz(timeZone);
        }

        return `${momentValue.toString()} (${momentValue.tz()})`;
    }

    render() {
        const {
            value: unparsed = this.state.now,
            children,
            useSemanticOutput = true,
            timeZone,
            label,
            className,
        } = this.props;

        const value = unparsed instanceof Date ? unparsed : new Date(unparsed);
        const formats = this.getFormats(value);
        const parts = this.formatParts(value, formats);
        const formatted = Timestamp.format(parts);

        this.nextUpdate = this.maybeUpdate(formats.relative);

        if (children) {
            return resolve(children, {value, formatted, ...parts}, formats);
        }

        if (useSemanticOutput) {
            return (
                <SemanticTime
                    value={value}
                    label={label || Timestamp.formatLabel(value, timeZone)}
                    className={className}
                >
                    {formatted}
                </SemanticTime>
            );
        }

        return formatted;
    }
}

export default injectIntl(Timestamp);
