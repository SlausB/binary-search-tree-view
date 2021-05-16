import * as svg from '@svgdotjs/svg.js'
import Streams from '@slaus/simple_streams/lib/space'
import { random_int } from './utils'
const randomColor = require('randomcolor')
import BST, { Node } from './bst'

const NODE_RADIUS = 22
const EDGE_LENGTH = 90

class Data {
    key : number
    color : string = randomColor() as string
    pos : Point = new Point(0,0)
    
    view : svg.G
    edge : svg.G

    constructor( key : number ) {
        this.key = key
    }
    move( p : Point ) {
        this.pos.x = p.x
        this.pos.y = p.y
        this.view.center( p.x, p.y )
    }
}

class Canvas {
    canvas = svg.SVG().addTo('#chartdiv').size('100%', '100%')
    container = this.canvas.group()
    edges = this.container.group()
    nodes = this.container.group()
    remove : (k:number)=>any

    constructor( remove : (k:number)=>any ) {
        this.remove = remove
    }

    init_graphics( data : Data ) {
        data.view = this.nodes.group()
        data.edge = this.edges.group()
        data.view.click( () => this.remove( data.key ) )
    }
}

export default function( streams : Streams ) {
    animate( streams )

    const bst = new BST< Data >()

    const canvas = new Canvas( remove )

    streams.s( 'resize' ).on(()=>{
        const bbox = document.getElementById('chartdiv').getBoundingClientRect()
        canvas.container.transform({
            translate : [
                bbox.width / 2,
                bbox.height / 2,
            ],
        })
    })
    streams.s( 'resize' ).next()

    function remove( key : number ) {
        bst.remove_by_key( key )

        canvas.edges.clear()
        canvas.nodes.clear()
        bst.for_each( node => {
            canvas.init_graphics( node.value )
            insert_graphics(
                bst,
                node.key,
            )
        })
    }

    streams.s( 'spacebar' ).on( () => {
        const key = random_int( -100, 100 )
        insert( canvas, bst, key )
        
        //const ins = new Insertion( bst.root, new Data( key ) )
    })

    //nodes currently trying to find their place to get inserted (animating) - not part of target tree yet:
    const insertions : Insertion[] = []
    streams.s( 'tick' ).on( seconds => {
        for ( let i = 0; i < insertions.length; ++ i ) {
            const ins = insertions[ i ]
            step( ins, bst, seconds )
            if ( ! ins.data ) {
                insertions.splice( i, 1 )
                -- i
            }
        }
    })
}

function insert( canvas : Canvas, bst : BST<Data>, key : number ) {
    const data = new Data( key )
    canvas.init_graphics( data )
    
    bst.insert(
        key,
        data,
    )
    insert_graphics(
        bst,
        key,
    )
}

class Insertion {
    /** Nearest node this insertion is currently animating to.*/
    target_key : number
    passed_key : number
    data : Data
    constructor( root : Node<Data> | undefined, data : Data ) {
        this.target_key = root ? root.key : data.key
        this.passed_key = data.key
        this.data = data
    }
}
function step(
    insertion : Insertion,
    bst : BST< Data >,
    seconds : number,
) {
    //locating the position of the node this insertion is currently moving to:
    const caret = new Caret
    let node = bst.root
    while ( node ) {
        caret.move()
        if ( insertion.data.key == node.key ) {
            break
        }
        else if ( insertion.data.key < node.key ) {
            caret.turn_left()
            node = node.left
        }
        else {
            caret.turn_right()
            node = node.right
        }
    }

    if ( move( insertion.data, caret, seconds ) ) {
        if ( node ) {

        }
        else {
            insertion.data.view.clear()
            delete insertion.data
            bst.insert
        }
    }
}
const SPEED = 60
function move( data : Data, target : Caret, seconds : number ) : boolean {
    const pos = new Point( data.pos.x, data.pos.y )
    const movement = SPEED * seconds
    let x_reached = false
    let y_reached = false
    if ( target.pos.x > pos.x ) {
        pos.x += movement
        if ( pos.x > target.pos.x ) {
            pos.x = target.pos.x
            x_reached = true
        }
    }
    if ( target.pos.x < pos.x ) {
        pos.x -= movement
        if ( pos.x < target.pos.x ) {
            pos.x = target.pos.x
            x_reached = true
        }
    }
    if ( target.pos.y > pos.y ) {
        pos.y += movement
        if ( pos.y > target.pos.y ) {
            pos.y = target.pos.y
            y_reached = true
        }
    }
    if ( target.pos.y < pos.y ) {
        pos.y -= movement
        if ( pos.y < target.pos.y ) {
            pos.y = target.pos.y
            y_reached = true
        }
    }
    data.move( pos )
    return x_reached && y_reached
}

function insert_graphics(
    bst : BST< Data >,
    key : number,
) {
    const caret = new Caret
    let parent : Node< Data > | undefined = undefined
    let node = bst.root
    while ( node ) {
        caret.move()

        if ( key == node.key ) {
            break
        }

        parent = node

        if ( key < node.key ) {
            node = node.left
            caret.turn_left()
        }
        else {
            node = node.right
            caret.turn_right()
        }
    }
    node.value.pos = caret.pos

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
    node.value.view.center( caret.pos.x, caret.pos.y )

    if ( parent ) {
        node.value.edge
            .line(
                parent.value.pos.x,
                parent.value.pos.y,
                caret.pos.x,
                caret.pos.y,
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

class Caret {
    pos = new Point( 0, 0 )
    direction = Math.PI / 2
    range = Math.PI
    depth = 0

    turn_left() {
        this.narrow()
        this.direction -= this.range
    }
    turn_right() {
        this.narrow()
        this.direction += this.range
    }

    narrow() {
        this.range = this.range / 2 + Math.PI * ( 1 - Math.pow( 0.97, this.depth ) )
    }
    move() {
        const edge_length = EDGE_LENGTH * Math.pow( 0.97, this.depth )
        this.pos.translate( this.direction, edge_length )
    }
}

function animate( streams : Streams ) {
    let lastTime = Date.now()
    requestAnimationFrame( () => animate( streams ) )
    const now = Date.now()
    const dt = now - lastTime
    lastTime = now
    streams.s( 'tick' ).next( dt / 1000 )
}
