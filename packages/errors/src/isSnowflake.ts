// ids reached 17 digits in late january 2015. a 64-bit id has at most 20
const SNOWFLAKE = /^\d{17,20}$/;

export function isSnowflake(value: string): boolean {
    return SNOWFLAKE.test(value);
}
