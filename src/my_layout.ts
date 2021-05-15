import * as svg from '@svgdotjs/svg.js'
import Streams from '@slaus/simple_streams/lib/space'
import { random_int } from './utils'
const randomColor = require('randomcolor')

const NODE_RADIUS = 22
const EDGE_LENGTH = 90


class Node< Value > {
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

function remove< Value >( node : Node< Value > ) {
    if ( node.left && node.right ) {
        const successor = find_min( node.right )
        node.key = successor.key
        remove( successor )
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

type Graphics = {
    value : number
    color : string
}

export default function( streams : Streams ) {
    let root : Node< Graphics > | undefined = undefined

    const canvas = svg.SVG().addTo('#chartdiv').size('100%', '100%')

    function on_click( node : Node< Graphics > ) {
        remove( node )
        streams.s( 'draw' ).next()
    }

    streams.s( 'draw' ).on( () => {
        canvas.clear()
        const edges = canvas.group()
        const nodes = canvas.group()

        const bbox = document.getElementById('chartdiv').getBoundingClientRect()

        draw_node(
            nodes,
            edges,
            on_click,
            new Point(
                bbox.width / 2,
                bbox.height / 2,
            ),
            root,
        )
    })
    streams.s( 'resize' ).to( 'draw' )
    streams.s( 'draw' ).next()

    streams.s( 'spacebar' )
        .do( () => {
            const key = random_int( -100, 100 )
            root = insert(
                root,
                key,
                {
                    value : key,
                    color : randomColor(),
                }
            )
        })
        .to( 'draw' )
}

function draw_node(
    nodes : svg.G,
    edges : svg.G,
    on_click : (e:Node< Graphics >) => void,
    pos : Point,
    node : Node< Graphics > | undefined,
    direction : number = Math.PI / 2,
    depth = 0,
    range = Math.PI,
    parent_pos : Point | undefined = undefined,
) {
    if ( ! node )
        return
    
    const view = nodes.group()
    view
        .circle( NODE_RADIUS * 2 )
        .fill( node.value.color )
        .attr( 'shape-rendering', 'geometricPrecision' )
        .attr( 'anchor', 'middle' )
    view
        .text( node.value.value.toString() )
        .fill( '#00291d' )
        .attr( 'anchor', 'middle' )
        .attr( 'font-size', NODE_RADIUS )
        .attr({
            'stroke' : '#0049bf',
            'stroke-width' : '1px',
            'stroke-opacity' : '1',
        })
        .center( NODE_RADIUS, NODE_RADIUS )

    view.translate( pos.x, pos.y )
    view.click( () => on_click( node ) )
    
    if ( parent_pos ) {
        const edge = edges.group()
        edge
            .line(
                parent_pos.x + NODE_RADIUS,
                parent_pos.y + NODE_RADIUS,
                pos.x + NODE_RADIUS,
                pos.y + NODE_RADIUS,
            )
            .stroke({ width: 4, color : 'black', })
            .back()
    }
    
    const next_range = range / 2 + Math.PI * ( 1 - Math.pow( 0.97, depth ) )
    const edge_length = EDGE_LENGTH * Math.pow( 0.97, depth )
    //left:
    const left_dir = direction - next_range
    draw_node(
        nodes,
        edges,
        on_click,
        pos.translate( left_dir, edge_length ),
        node.left,
        left_dir,
        depth + 1,
        next_range,
        pos,
    )
    //right:
    const right_dir = direction + next_range
    draw_node(
        nodes,
        edges,
        on_click,
        pos.translate( right_dir, edge_length ),
        node.right,
        right_dir,
        depth + 1,
        next_range,
        pos,
    )
}

class Point {
    x : number
    y : number

    constructor( x : number, y : number ) {
        this.x = x
        this.y = y
    }

    translate( radians : number, length : number ) {
        return new Point(
            this.x + Math.sin( radians ) * length,
            this.y + Math.cos( radians ) * length,
        )
    }
}
