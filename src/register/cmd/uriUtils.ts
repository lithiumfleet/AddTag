import * as vscode from 'vscode';
import { Utils } from 'vscode-uri';


/**
 * Fix uri. i.e some directories not ends with '/', resulting in wrongly inequalment.
 * 
 * @param uri the uri need to be fixed
 * @returns correct uri
 */
export async function trailingFix(uri: vscode.Uri): Promise<vscode.Uri> {
    if (await checkIfFileOrDirectory(uri) === 'Directory' && !uri.path.endsWith('/')) {
        return Utils.joinPath(uri, './') as vscode.Uri
    }
    if (await checkIfFileOrDirectory(uri) === 'File' && uri.path.endsWith('/')) {
        const newPath = uri.toString()
        return vscode.Uri.parse(newPath.slice(0, newPath.length-1), true)
    }
    return uri
}

async function checkIfFileOrDirectory(uri: vscode.Uri): Promise<string> {
    try {
        // Fetch the stats for the Uri
        const stat = await vscode.workspace.fs.stat(uri);

        // Check if it's a file or directory
        if (stat.type === vscode.FileType.File) {
            return 'File';
        } else if (stat.type === vscode.FileType.Directory) {
            return 'Directory';
        } else {
            return 'Unknown type';
        }
    } catch (error) {
        // Handle errors, such as if the Uri doesn't exist or can't be accessed
        console.error('Error checking Uri:', error);
        return 'Error';
    }
}
