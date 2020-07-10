# Timestamp

`<Timestamp/>` is a component that makes displaying dates and times easy.

It supports Relative, Fixed, or a special combination of Relative (Day) plus Fixed (time).

Its redux connector handles Timezone and 12/24HR preference handling (inherited from `local_date_time`). (By itself, `<Timestamp/>` is not dependent on any mattermost-webapp runtime dependencies.)

## Relative

Might be considered more natural expressions of time (to people).

- `yesterday`
- `5 minutes ago`
- `now`
- `in 7 days`

## Fixed

- `December 12, 2019`
- `July 12`
- `Wednesday at 13:05`

`<Timestamp/>` and its props are designed to allow for deep customization with _sensible defaults_.

```ts
type Props = FormatOptions & {
    value?: string | number | Date;

    useRelative?: Resolvable<string | RelativeOptions | false, {rawDate: Date}, FormatOptions>;
    ranges?: RangeDescriptor[];

    useDate?: Resolvable<DateTimeOptions | false, {rawDate: Date}, FormatOptions>;
    useTime?: Resolvable<DateTimeOptions | false, {rawDate: Date}, FormatOptions>;

    children?: Resolvable<ReactNode, {rawDate: Date} & Parts, ResolvedFormats>;
    className?: string;

    // ...
};
```

`FormatOptions` is essentially combination of `Intl.FormatDateTimeOptions` and `Intl.RelativeTimeFormatOptions`

## Format Selectors

`useRelative` and/or `useDate` control the formatting of `dateOrRel`

`useTime` controls the formatting of `time`

By default, `<Timestamp/>` will output Fixed date-time.

If you'd like it to output relative, specify a `unit`, or give it `ranges` to define what unit to use conditionally.

## Examples

```tsx
// Change the output
<Timestamp value={new Date()}>
    {({dateOrRel, time}) => {
        return `Posted at ${time} on ${dateOrRel}`;
    }}
</Timestamp>

```

```tsx
// What time is it (now) in...?
<Timestamp
    useRelative={false}
    useDate={false}
    timeZone={this.props.user.timezone}
/>
```

Given:

```tsx
<Timestamp
    value={value}
    ranges={[
        {within: ['second', -20], display: ['second', 0]}, // now
        {within: ['second', -56], display: ['second', 5]}, // 20-55s (%5)
        {within: ['minute', -60], display: ['minute', 1]}, // 1-59m (%1)
        {within: ['hour', -6, RoundTo.Floor], display: ['hour', 1]}, // 1-6hr (%1)
    ]}
    useDate={false}
/>
```

Diff|Display
---|---
0-22.4s | now
~-25s | 25 sec. ago
~-30s | 30 sec. ago
... | ...
~-55s | 55 sec. ago
~-1m | 1 min. ago
~-2m | 2 min. ago
... | ...
~-59m | 59 min. ago
~-1h | 1 hr. ago
~-6h | 6 hr. ago
>6h | 12:05
