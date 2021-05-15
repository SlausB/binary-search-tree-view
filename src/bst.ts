
export default class BST< Value > {
    root : Node< Value > | undefined = undefined

    insert( key : number, value : Value ) {
        this.root = insert( this.root, key, value )
    }
    remove( node : Node< Value > ) {
        if ( node.left && node.right ) {
            const successor = find_min( node.right )
            node.key = successor.key
            node.value = successor.value
            this.remove( successor )
        }
        else if ( node.left ) {
            replace_node_in_parent( node, node.left )
        }
        else if ( node.right ) {
            replace_node_in_parent( node, node.right )
        }
        else {
            remove_node_in_parent( node )
        }
    }
}

export class Node< Value > {
    key : number
    value : Value

    left  : Node<Value> | undefined
    right : Node<Value> | undefined
    parent : Node<Value> | undefined

    constructor( key : number, value : Value ) {
        this.key = key
        this.value = value
    }
}

function insert< Value >( parent : Node< Value >, key : number, value : Value ) : Node< Value > {
    if ( ! parent ) {
        return new Node( key, value )
    }
    //value already present in the tree:
    if ( key == parent.key ) {
        parent.value = value
        return parent
    }
    else if ( key < parent.key ) {
        parent.left = insert( parent.left, key, value )
    }
    else {
        parent.right = insert( parent.right, key, value )
    }
    return parent
}


function find_min< Value >( node : Node< Value > ) : Node< Value > {
    if ( node.left )
        return find_min( node.left )
    return node
}
function remove_node_in_parent< Value >( node : Node< Value > ) {
    if ( node.parent ) {
        if ( node.parent.left == node )
            node.parent.left = undefined
        else
            node.parent.right = undefined
    }
}
function replace_node_in_parent< Value >( node : Node< Value >, new_child : Node< Value > ) {
    if ( node.parent ) {
        if ( node.parent.left == node )
            node.parent.left = new_child
        else
            node.parent.right = new_child
    }

    remove_node_in_parent( node )
}