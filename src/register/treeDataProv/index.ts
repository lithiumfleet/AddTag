import { TreeDataProvider, Event, EventEmitter, ProviderResult, TreeItem, TreeItemCollapsibleState, window, Disposable, Uri } from "vscode";


/**
 * The data resource for tagtree
 */
export interface ITagTreeDS {
    refreshTree(): ITreeNode
    onUpdate: Event<undefined>
}

export interface ITreeNode {
    uri: Uri
    name: string
    tag?: string

    getChildren(): ITreeNode[]
}



class TagTreeProvider implements TreeDataProvider<ITreeNode> {
    private readonly _onDidChangeTreeData = new EventEmitter<undefined>()
    onDidChangeTreeData = this._onDidChangeTreeData.event

    // getter & setter for tree root
    _root?: ITreeNode
    get root(): ITreeNode {
        if (!this._root) throw new Error("root not set")
        return this._root
    }
    set root(node: ITreeNode) {
        this._root = node
    }

    /**
     * Derived from TreeDataProvider. 
     * This function will determine how to show the data in tree view.
     * 
     * @param node 
     * @returns 
     */
    getTreeItem(node: ITreeNode): TreeItem {
        const item = new TreeItem(node.name)
        item.collapsibleState = 
            node.getChildren().length === 0 ?
            TreeItemCollapsibleState.None :
            TreeItemCollapsibleState.Expanded
            
        item.resourceUri = node.uri
        item.description = node.tag
        return item
    }

    /**
     * Derived from TreeDataProvider. 
     * 
     * @param node 
     * @returns 
     */
    getChildren(node?: ITreeNode): ProviderResult<ITreeNode[]> {
        if (!node) return [this.root]
        return node.getChildren()
    }

    refresh() {
        this.root = this.ds.refreshTree()
        this._onDidChangeTreeData.fire(undefined)
    }

    ds: ITagTreeDS
    constructor(ds: ITagTreeDS) {
        this.ds = ds
        this.ds.onUpdate(() => this.refresh())
        this.refresh()
    }
}


export function registerTreeDataProvider(ds: ITagTreeDS): Disposable {
    return window.registerTreeDataProvider('tags', new TagTreeProvider(ds))
}