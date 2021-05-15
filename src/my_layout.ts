import * as svg from '@svgdotjs/svg.js'
import Streams from '@slaus/simple_streams/lib/space'
import { random_int } from './utils'

/** Which direction tree is growing.*/
const DIR = Math.PI / 4
const NODE_RADIUS = 40
const EDGE_LENGTH = 40

class Node {
    value : number
    left  : Node | undefined = undefined
    right : Node | undefined = undefined

    constructor( value : number ) {
        this.value = value
    }
}

export default function( streams : Streams ) {
    let root : Node | undefined = undefined

    const canvas = svg.SVG().addTo('#chartdiv').size('100%', '100%')
    const nodes = canvas.group()

    function draw() {
        nodes.clear()
        draw_node( canvas, root )
    }
    streams.s( 'resize' ).on( draw )
    draw()

    streams.s( 'spacebar' ).on( () => {
        root = new Node( 42 )
        draw()
    })
}

function draw_node( canvas : svg.Svg, node : Node | undefined ) {
    if ( ! node )
        return
    
    const view = canvas.group()
    view.circle( NODE_RADIUS * 2 ).fill( '#5144ff' ).attr( 'shape-rendering', 'optimizeQuality' ).attr( 'anchor', 'middle' )
    view.text( '42' ).fill( '#00291d' ).attr( 'anchor', 'middle' ).attr( 'font-size', 50 ).center( NODE_RADIUS, NODE_RADIUS )
    
    draw_node( canvas, node.left )
    draw_node( canvas, node.right )
}
