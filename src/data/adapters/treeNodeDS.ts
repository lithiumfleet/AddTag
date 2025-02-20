import { Uri, WorkspaceFolder } from "vscode";
import { Utils } from "vscode-uri";
import { ITreeNode, ITagTreeDS } from "../../register/treeDataProv";
import { GTagMapper } from "../tag";

class CTreeNode implements ITreeNode {
    constructor(
        public uri: Uri,
        public name: string,
        public tag?: string
    ) { }

    // the children of a node **only** have one universual path prefix.
    // that is, they must be brothers(or sisters :-)
    private _children: CTreeNode[] = [];
    get children(): CTreeNode[] {
        return this._children;
    }
    set children(newChildren: CTreeNode[]) {
        this._children = newChildren;
    }

    getChildren(): ITreeNode[] {
        return this.children;
    }

    static fromUri(uri: Uri): CTreeNode {
        const name = Utils.basename(uri);
        const tag = GTagMapper.get(uri)?.tag;
        return new CTreeNode(uri, name, tag);
    }

}


/**
 * A multi-branches tree for restore the nodes.
 */
class CTagTreeDS implements ITagTreeDS {
    constructor(
        private workspace: WorkspaceFolder
    ) { }

    refreshTree(): CTreeNode {
        const uri = Utils.joinPath(this.workspace.uri, "./"); // Note: add '/' at the end of workspace uri.
        const name = this.workspace.name;
        const tag = GTagMapper.get(uri)?.tag;
        const root = new CTreeNode(uri, name, tag);

        // read from glabal mapper to get all uris been marked
        for (const k of GTagMapper.keys()) {
            const node = CTreeNode.fromUri(k);
            this.addToTree(root, node);
        }

        return root;

    }

    addToTree(root: CTreeNode, node: CTreeNode) {
        if (root.children.length === 0) {
            root.children.push(node);
            return;
        }
        // recursive function to add one node to root
        addToRoot(root, node);
    }

    onUpdate = GTagMapper.onUpdate;
}

/**
 * Recursive add node to root.
 * The node will follow the longest path
 * 
 * @param root 
 * @param node 
 * @returns 
 */
function addToRoot(root: CTreeNode, node: CTreeNode) {
    if (equalUri(root.uri, node.uri)) {
        root.name = node.name;
        root.tag = node.tag;
        return;
    }

    let mergeHappend = false;
    let mergedNode: CTreeNode | undefined;
    let indexToRemove: number | undefined;
    for (const [i, child] of root.children.entries()) {
        const prefix = getLongestPrefix(child, node);
        if (equalUri(prefix, child.uri)) {
            addToRoot(child, node);
            return;
        } else if (equalUri(prefix, node.uri)) {
            const tempNode = child
            root.children[i] = node
            addToRoot(node, tempNode)
            return
        } else if (!equalUri(prefix, root.uri)) {
            mergeHappend = true;
            mergedNode = combineNodes(prefix, child, node);
            indexToRemove = i;
            break;
        }
    }

    if (mergeHappend && indexToRemove !== undefined && mergedNode) {
        root.children.splice(indexToRemove, 1);
        root.children.push(mergedNode);
    } else {
        root.children.push(node);
    }
}


/**
 * Combine two node to one node.
 * The parent node's uri will be set to prefix
 * 
 * @param prefix 
 * @param a 
 * @param b 
 * @returns the parent node of a & b
 */
function combineNodes(prefix: Uri, a: CTreeNode, b: CTreeNode): CTreeNode {
    const name = Utils.basename(prefix);
    const newNode = new CTreeNode(prefix, name);
    newNode.children = [a, b];
    return newNode;
}
/**
 * Get longest prefix uri from two node's uri.
 * The prefix must be a valid uri, which means it will refers to one directory/file
 * 
 * @param a 
 * @param b 
 * @returns 
 */
function getLongestPrefix(a: CTreeNode, b: CTreeNode): Uri {
    const patha: string = a.uri.toString();
    const pathb: string = b.uri.toString();
    let prefix: string = function _getLongestPrefix(patha: string, pathb: string): string {
        let i = 0;
        while (i < patha.length && i < pathb.length && patha[i] === pathb[i]) {
            i++;
        }
        return patha.substring(0, i);
    }(patha, pathb);

    // for those prefix like prefix("src/go.sum", "src/go.lock") = "src/go."
    while (!prefix.endsWith('/')) {
        prefix = prefix.slice(0, prefix.length - 1);
    }

    return Uri.parse(prefix, true);
}
/**
 * Check whether a & b are equivlent. Can not use a === b to check.
 * @param a 
 * @param b 
 * @returns 
 */
function equalUri(a: Uri, b: Uri): Boolean {
    return a.toString() === b.toString();
}

export const cTagTreeDS = (ws: WorkspaceFolder) => new CTagTreeDS(ws);
