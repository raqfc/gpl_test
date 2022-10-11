// @ts-ignore
import pluralize from 'pluralize';

export function separateWordsCamelCase(input: string): string[] {
    return input.replace(/([A-Z])/g, ' $1').split(' ')
}

export function inPlural(input: string, count: number): string {
    return pluralize(input, count);
}
