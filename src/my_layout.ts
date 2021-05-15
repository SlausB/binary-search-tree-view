import * as svg from '@svgdotjs/svg.js'
import Streams from '@slaus/simple_streams/lib/space'
import { random_int } from './utils'
const randomColor = require('randomcolor')
import BST, { Node } from './bst'

const NODE_RADIUS = 22
const EDGE_LENGTH = 90


type Graphics = {
    view : svg.G
    edge : svg.G
    pos : Point
}

export default function( streams : Streams ) {
    const bst = new BST< Graphics >()

    const canvas = svg.SVG().addTo('#chartdiv').size('100%', '100%')
    const container = canvas.group()
    const edges = container.group()
    const nodes = container.group()

    streams.s( 'resize' ).on(()=>{
        const bbox = document.getElementById('chartdiv').getBoundingClientRect()
        container.transform({
            translate : [
                bbox.width / 2,
                bbox.height / 2,
            ],
        })
    })
    streams.s( 'resize' ).next()

    streams.s( 'spacebar' ).on( () => {
        const key = random_int( -100, 100 )
        const graphics = {
            view : nodes.group(),
            edge : edges.group(),
            pos : new Point(0,0),
        }
        bst.insert(
            key,
            graphics,
        )
        insert_graphics(
            bst,
            key,
        )
        graphics.view.click( () => bst.remove_by_key( key ) )
    })
}

function insert_graphics(
    bst : BST< Graphics >,
    key : number,
) {
    const color = randomColor() as string

    const pos = new Point( 0, 0 )
    let direction = Math.PI / 2
    let range = Math.PI
    let parent : Node< Graphics > | undefined = undefined
    let node = bst.root
    for ( let depth = 0; node; ++ depth ) {
        if ( key == node.key ) {
            break
        }

        const edge_length = EDGE_LENGTH * Math.pow( 0.97, depth )
        pos.translate( direction, edge_length )
        range = range / 2 + Math.PI * ( 1 - Math.pow( 0.97, depth ) )

        parent = node

        if ( key < node.key ) {
            node = node.left
            direction -= range
        }
        else {
            node = node.right
            direction += range
        }
    }
    node.value.pos = pos

    node.value.view
        .circle( NODE_RADIUS * 2 )
        .fill( color )
        .attr( 'shape-rendering', 'geometricPrecision' )
        .attr( 'anchor', 'middle' )
        //.center( 0, 0 )
    node.value.view
        .text( key.toString() )
        .fill( '#00291d' )
        .attr( 'anchor', 'middle' )
        .attr( 'font-size', NODE_RADIUS )
        .attr({
            'stroke' : '#0049bf',
            'stroke-width' : '1px',
            'stroke-opacity' : '1',
            x : NODE_RADIUS,
            'text-anchor' : "middle",
        })
        //.center( NODE_RADIUS, NODE_RADIUS )
    node.value.view.center( pos.x, pos.y )

    if ( parent ) {
        node.value.edge
            .line(
                parent.value.pos.x,
                parent.value.pos.y,
                pos.x,
                pos.y,
            )
            .stroke({ width: 4, color : 'black', })
            .back()
    }
}

class Point {
    x : number
    y : number

    constructor( x : number, y : number ) {
        this.x = x
        this.y = y
    }

    translate( radians : number, length : number ) {
        this.x += Math.sin( radians ) * length
        this.y += Math.cos( radians ) * length
    }
}
