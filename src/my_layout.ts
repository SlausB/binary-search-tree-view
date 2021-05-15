import * as svg from '@svgdotjs/svg.js'
import Streams from '@slaus/simple_streams/lib/space'
import { random_int } from './utils'
const randomColor = require('randomcolor')

const NODE_RADIUS = 22
const EDGE_LENGTH = 90

class Node {
    value : number
    color : string
    left  : Tree = new Tree
    right : Tree = new Tree

    constructor( value : number, color : string ) {
        this.value = value
        this.color = color
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

    streams.s( 'draw' ).on( () => {
        canvas.clear()

        const bbox = document.getElementById('chartdiv').getBoundingClientRect()

        draw_node(
            canvas,
            bbox.width / 2,
            bbox.height / 2,
            bst.node,
        )
    })
    streams.s( 'resize' ).to( 'draw' )
    streams.s( 'draw' ).next()

    streams.s( 'spacebar' )
        .do( () => {
            insert(
                bst,
                new Node(
                    random_int( -100, 100 ),
                    randomColor(),
                )
            )
        })
        .to( 'draw' )
}

function draw_node(
    canvas : svg.Svg,
    x : number,
    y : number,
    node : Node | undefined,
    direction : number = Math.PI / 2,
    depth = 0,
    range = Math.PI,
) {
    if ( ! node )
        return
    
    const view = canvas.group()
    view
        .circle( NODE_RADIUS * 2 )
        .fill( node.color )
        .attr( 'shape-rendering', 'geometricPrecision' )
        .attr( 'anchor', 'middle' )
    view
        .text( node.value.toString() )
        .fill( '#00291d' )
        .attr( 'anchor', 'middle' )
        .attr( 'font-size', NODE_RADIUS )
        .attr({
            'stroke' : '#0049bf',
            'stroke-width' : '1px',
            'stroke-opacity' : '1',
        })
        .center( NODE_RADIUS, NODE_RADIUS )

    view.translate( x, y )
    
    const next_range = range / 2 + Math.PI * ( 1 - Math.pow( 0.97, depth ) )
    const edge_length = EDGE_LENGTH * Math.pow( 0.97, depth )
    //left:
    const left_dir = direction - next_range
    draw_node(
        canvas,
        x + Math.sin( left_dir ) * edge_length,
        y + Math.cos( left_dir ) * edge_length,
        node.left.node,
        left_dir,
        depth + 1,
        next_range,
    )
    //right:
    const right_dir = direction + next_range
    draw_node(
        canvas,
        x + Math.sin( right_dir ) * edge_length,
        y + Math.cos( right_dir ) * edge_length,
        node.right.node,
        right_dir,
        depth + 1,
        next_range,
    )
}
