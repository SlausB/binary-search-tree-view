import * as svg from '@svgdotjs/svg.js'
import Streams from '@slaus/simple_streams/lib/space'
import { random_int } from './utils'

/** Which direction tree is growing.*/
const DIRECTION = Math.PI / 4
const BRANCH = Math.PI / 8
const NODE_RADIUS = 28
const EDGE_LENGTH = 64

class Node {
    value : number
    left  : Tree = new Tree
    right : Tree = new Tree

    constructor( value : number ) {
        this.value = value
    }
}
class Tree {
    node : Node | undefined = undefined
}

function insert( tree : Tree, new_one : Node ) {
    if ( ! tree.node ) {
        tree.node = new_one
        return
    }

    //value already present in the tree:
    if ( new_one.value == tree.node.value )
        return
    
    if ( new_one.value < tree.node.value ) {
        insert( tree.node.left, new_one )
        return
    }

    insert( tree.node.right, new_one )
}

export default function( streams : Streams ) {
    const bst = new Tree

    const canvas = svg.SVG().addTo('#chartdiv').size('100%', '100%')
    const nodes = canvas.group()

    function draw() {
        nodes.clear()
        draw_node(
            canvas,
            200,
            200,
            DIRECTION,
            bst.node,
        )
    }
    streams.s( 'resize' ).on( draw )
    draw()

    streams.s( 'spacebar' ).on( () => {
        insert( bst, new Node( random_int( -100, 100 ) ) )
        draw()
    })
}

function draw_node(
    canvas : svg.Svg,
    x : number,
    y : number,
    direction : number,
    node : Node | undefined,
) {
    if ( ! node )
        return
    
    const view = canvas.group()
    view.circle( NODE_RADIUS * 2 ).fill( '#5144ff' ).attr( 'shape-rendering', 'optimizeQuality' ).attr( 'anchor', 'middle' )
    view.text( node.value.toString() ).fill( '#00291d' ).attr( 'anchor', 'middle' ).attr( 'font-size', NODE_RADIUS ).center( NODE_RADIUS, NODE_RADIUS )

    view.translate( x, y )
    console.log( 'x:', x, 'y:', y )
    
    //left:
    draw_node(
        canvas,
        x + Math.sin( direction - BRANCH ) * EDGE_LENGTH,
        y + Math.cos( direction - BRANCH ) * EDGE_LENGTH,
        direction - BRANCH,
        node.left.node,
    )
    //right:
    draw_node(
        canvas,
        x + Math.sin( direction + BRANCH ) * EDGE_LENGTH,
        y + Math.cos( direction + BRANCH ) * EDGE_LENGTH,
        direction + BRANCH,
        node.right.node,
    )
}
