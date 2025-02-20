import { FileDecoration, Uri, WorkspaceFolder } from "vscode";
import { IFileDecoDS } from "../register/fileDecoProv";
import { GTagMapper } from "./tag";


class CFileDecoDS implements IFileDecoDS {
    get(uri: Uri): FileDecoration | undefined {
        const info = GTagMapper.get(uri)
        return new FileDecoration(info?.tag?? "")
    }

    onUpdate = GTagMapper.onUpdate
}

export const cFileDecoDS = new CFileDecoDS()


import { ITagTreeDS, ITreeNode } from "../register/treeDataProv";
import { Utils } from "vscode-uri";

class CTreeNode implements ITreeNode {
    constructor(
        public uri: Uri,
        public name: string,
        public tag?: string,
    ) { }

    private _children: CTreeNode[] = []
    get children(): CTreeNode[] {
        return this._children
    }
    set children(newChildren: CTreeNode[]) {
        this._children = newChildren
    }

    getChildren(): ITreeNode[] {
        return this.children
    }

    static fromUri(uri: Uri): CTreeNode {
        const name = Utils.basename(uri)
        const tag = GTagMapper.get(uri)?.tag
        return new CTreeNode(uri, name, tag)
    }

}

function addToRoot(root: CTreeNode, node: CTreeNode) {
    if (equalUri(root.uri, node.uri)) {
        root.name = node.name
        root.tag = node.tag
        return
    }

    let mergeHappend = false
    let mergedNode: CTreeNode | undefined
    let indexToRemove: number | undefined
    for (const [i, child] of root.children.entries()) {
        const prefix = getLongestPrefix(child, node)
        if (equalUri(prefix, child.uri)) {
            addToRoot(child, node)
            return
        } else if (!equalUri(prefix, root.uri)) {
            mergeHappend = true
            mergedNode = combineNodes(prefix, child, node)
            indexToRemove = i
            break
        }
    }

    if (mergeHappend && indexToRemove !== undefined && mergedNode) {
        root.children.splice(indexToRemove, 1)
        root.children.push(mergedNode)
    } else {
        root.children.push(node)
    }
}

function combineNodes(prefix: Uri, a: CTreeNode, b: CTreeNode): CTreeNode {
    const name = Utils.basename(prefix)
    const newNode = new CTreeNode(prefix, name)
    newNode.children = [a, b]
    return newNode
}

function getLongestPrefix(a: CTreeNode, b: CTreeNode): Uri {
    const patha: string = a.uri.toString()
    const pathb: string = b.uri.toString()
    let prefix: string = function _getLongestPrefix(patha: string, pathb: string): string {
        let i = 0;
        while (i < patha.length && i < pathb.length && patha[i] === pathb[i]) {
            i++;
        }
        return patha.substring(0, i);
    }(patha, pathb)

    // for those prefix like prefix("src/go.sum", "src/go.lock") = "src/go."
    while (!prefix.endsWith('/')) {
        prefix = prefix.slice(0, prefix.length-1)
    }

    return Uri.parse(prefix, true)
}

function equalUri(a: Uri, b: Uri): Boolean {
    return a.toString() === b.toString()
}

class CTagTreeDS implements ITagTreeDS {
    constructor(
        private workspace: WorkspaceFolder
    ) { }

    refreshTree(): CTreeNode {
        const uri = Utils.joinPath(this.workspace.uri, "./") // Note: add '/' at the end of workspace uri.
        const name = this.workspace.name
        const tag = GTagMapper.get(uri)?.tag
        const root = new CTreeNode(uri, name, tag)

        for (const k of GTagMapper.keys()) {
            const node = CTreeNode.fromUri(k)
            this.addToTree(root, node)
        }

        return root

    }

    addToTree(root: CTreeNode, node: CTreeNode) {
        if (root.children.length === 0) {
            root.children.push(node)
            return
        }
        addToRoot(root, node)
    }

    onUpdate = GTagMapper.onUpdate
}

export const cTagTreeDS = (ws: WorkspaceFolder) => new CTagTreeDS(ws)

