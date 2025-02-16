// Hacky trick from https://github.com/sumneko/vscode-file-alias
// Thanks!

import { FileDecoration } from 'vscode';

export function enableLongBandge() {
    // hack VSCode: src\vs\workbench\api\common\extHostTypes.ts:2913
    // @ts-ignore
    FileDecoration.validate = (d: FileDecoration): void => {
        if (d.badge && d.badge.length !== 1 && d.badge.length !== 2) {
            //throw new Error(`The 'badge'-property must be undefined or a short character`);
        }
        if (!d.color && !d.badge && !d.tooltip) {
            throw new Error(`The decoration is empty`);
        }
    }
}

export function disableLongBandge() {
    // hack VSCode: src\vs\workbench\api\common\extHostTypes.ts:2913
    // @ts-ignore
    FileDecoration.validate = (d: FileDecoration): void => {
        if (d.badge && d.badge.length !== 1 && d.badge.length !== 2) {
            throw new Error(`The 'badge'-property must be undefined or a short character`);
        }
        if (!d.color && !d.badge && !d.tooltip) {
            throw new Error(`The decoration is empty`);
        }
    }
}