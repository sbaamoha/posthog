import { UniversalFiltersGroup } from 'lib/components/UniversalFilters/UniversalFilters'

import { DataTableNode, DateRange, ErrorTrackingOrder, EventsQuery, NodeKind } from '~/queries/schema'
import { AnyPropertyFilter } from '~/types'

export const errorTrackingQuery = ({
    order,
    dateRange,
    filterTestAccounts,
    filterGroup,
}: {
    order: ErrorTrackingOrder
    dateRange: DateRange
    filterTestAccounts: boolean
    filterGroup: UniversalFiltersGroup
}): DataTableNode => {
    return {
        kind: NodeKind.DataTableNode,
        source: {
            kind: NodeKind.EventsQuery,
            select: [
                'any(properties) -- Error',
                'properties.$exception_type',
                'count() as unique_occurrences -- Occurrences',
                'count(distinct $session_id) as unique_sessions -- Sessions',
                'count(distinct distinct_id) as unique_users -- Users',
                'max(timestamp) as last_seen',
                'min(timestamp) as first_seen',
            ],
            orderBy: [order],
            ...defaultProperties({ dateRange, filterTestAccounts, filterGroup }),
        },
        hiddenColumns: [
            'properties.$exception_type',
            'first_value(properties)',
            'max(timestamp) as last_seen',
            'min(timestamp) as first_seen',
        ],
        showActions: false,
        showTimings: false,
    }
}

export const errorTrackingGroupQuery = ({
    group,
    dateRange,
    filterTestAccounts,
    filterGroup,
}: {
    group: string
    dateRange: DateRange
    filterTestAccounts: boolean
    filterGroup: UniversalFiltersGroup
}): EventsQuery => {
    return {
        kind: NodeKind.EventsQuery,
        select: ['uuid', 'properties', 'timestamp', 'person'],
        where: [`properties.$exception_type = '${group}'`],
        ...defaultProperties({ dateRange, filterTestAccounts, filterGroup }),
    }
}

const defaultProperties = ({
    dateRange,
    filterTestAccounts,
    filterGroup,
}: {
    dateRange: DateRange
    filterTestAccounts: boolean
    filterGroup: UniversalFiltersGroup
}): Pick<EventsQuery, 'event' | 'after' | 'before' | 'filterTestAccounts' | 'properties'> => {
    const properties = filterGroup.values as AnyPropertyFilter[]

    return {
        event: '$exception',
        after: dateRange.date_from || undefined,
        before: dateRange.date_to || undefined,
        filterTestAccounts,
        properties,
    }
}
