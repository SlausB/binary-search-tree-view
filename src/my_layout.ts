import * as svg from '@svgdotjs/svg.js'
import Streams from '@slaus/simple_streams/lib/space'
import { random_int } from './utils'
const randomColor = require('randomcolor')
import BST, { Node } from './bst'

const NODE_RADIUS = 22
const EDGE_LENGTH = 90

class Data {
    color : string = randomColor() as string
    pos : Point = new Point(0,0)
    
    view : svg.G
    edge : svg.G
}

export default function( streams : Streams ) {
    const bst = new BST< Data >()

    const canvas = svg.SVG().addTo('#chartdiv').size('100%', '100%')
    const container = canvas.group()
    const edges = container.group()
    const nodes = container.group()
    function init_graphics( data : Data, key : number ) {
        data.view = nodes.group()
        data.edge = edges.group()
        data.view.click( () => remove( key ) )
    }

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

    function remove( key : number ) {
        bst.remove_by_key( key )

        edges.clear()
        nodes.clear()
        bst.for_each( node => {
            init_graphics( node.value, node.key )
            insert_graphics(
                bst,
                node.key,
            )
        })
    }

    streams.s( 'spacebar' ).on( () => {
        const key = random_int( -100, 100 )
        const data = new Data
        init_graphics( data, key )
        bst.insert(
            key,
            data,
        )
        insert_graphics(
            bst,
            key,
        )
    })
}

function insert_graphics(
    bst : BST< Data >,
    key : number,
) {
    const pos = new Point( 0, 0 )
    let direction = Math.PI / 2
    let range = Math.PI
    let parent : Node< Data > | undefined = undefined
    let node = bst.root
    for ( let depth = 0; node; ++ depth ) {
        const edge_length = EDGE_LENGTH * Math.pow( 0.97, depth )
        pos.translate( direction, edge_length )

        if ( key == node.key ) {
            break
        }

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
        .fill( node.value.color )
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
