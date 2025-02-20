import { FileDecorationProvider, Uri, CancellationToken, ProviderResult, FileDecoration, Event, Disposable, EventEmitter, window } from "vscode";

/**
 * The data source will be used by provider, then use DI to decrease the complexity
 */
export interface IFileDecoDS {
    get(uri: Uri): FileDecoration | undefined;
    onUpdate: Event<undefined>
}

class TagDecorationProvider implements FileDecorationProvider {
    private _onDidChangeFileDecorations = new EventEmitter<undefined>()
    onDidChangeFileDecorations: Event<undefined | Uri | Uri[]> = this._onDidChangeFileDecorations.event
    refresh(): void {
        this._onDidChangeFileDecorations.fire(undefined)
    }

    provideFileDecoration(uri: Uri, token: CancellationToken): ProviderResult<FileDecoration> {
        if (!this.fileDecoMap) {
            throw new Error("tagMapper is not set")
        }
        return this.fileDecoMap.get(uri)
    }

    private fileDecoMap?: IFileDecoDS = undefined
    setMapper(fileDecoMap: IFileDecoDS): void {
        this.fileDecoMap = fileDecoMap
        this.fileDecoMap.onUpdate(()=>this.refresh())
        this.refresh()
    }

}

export function registerProvider(datasource: IFileDecoDS): Disposable {
    const provider = new TagDecorationProvider()
    provider.setMapper(datasource)
    return window.registerFileDecorationProvider(provider)
}