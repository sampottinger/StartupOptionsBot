/**
 * Shraed objects for StartupOptionsBot.
 *
 * @license MIT
 */

const toolkit = StartUpOptionsBotLang.getToolkit();


/**
 * Format a number as en-US locale string.
 *
 * @param target - The number to format.
 * @returns Formatted string.
 */
function formatNumber(target) {
    return target.toLocaleString("en-US");
}