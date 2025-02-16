import { FileDecorationProvider, Uri, CancellationToken, ProviderResult, FileDecoration, Event, Disposable, EventEmitter, window } from "vscode";
import { TagMapper } from "./tag";

export class TagDecorationProvider implements FileDecorationProvider {
    private _onDidChangeFileDecorations = new EventEmitter<undefined>()
    onDidChangeFileDecorations: Event<undefined | Uri | Uri[]> = this._onDidChangeFileDecorations.event
    refresh(): void {
        this._onDidChangeFileDecorations.fire(undefined)
    }

    provideFileDecoration(uri: Uri, token: CancellationToken): ProviderResult<FileDecoration> {
        if (!this.tagMapper) {
            throw new Error("tagMapper is not set")
        }
        return this.tagMapper.get(uri)
    }

    private tagMapper?: TagMapper = undefined
    setMapper(tagMapper: TagMapper): void {
        this.tagMapper = tagMapper
        this.tagMapper.onUpdate(()=>this.refresh())
        this.refresh()
    }

}

export function registerProvider(tagMapper: TagMapper): Disposable {
    const provider = new TagDecorationProvider()
    provider.setMapper(tagMapper)
    return window.registerFileDecorationProvider(provider)
}