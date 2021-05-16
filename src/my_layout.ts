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
    insertions = this.container.group()
    remove : (k:number)=>any

    constructor( remove : (k:number)=>any ) {
        this.remove = remove
    }

    init_view( data : Data ) {
        data.view
            .circle( NODE_RADIUS * 2 )
            .fill( data.color )
            .attr( 'shape-rendering', 'geometricPrecision' )
            .attr( 'anchor', 'middle' )
            //.center( 0, 0 )
        data.view
            .text( data.key.toString() )
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
    }
    init_graphics( data : Data ) {
        data.view = this.nodes.group()
        data.edge = this.edges.group()
        this.init_view( data )
    }
    add_view( data : Data ) {
        this.init_graphics( data )
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
            canvas.add_view( node.value )
            insert_graphics(
                bst,
                node.key,
            )
        })
    }

    streams.s( 'spacebar' ).on( () => {
        const data = new Data( random_int( -100, 100 ) )
        data.view = canvas.insertions.group()
        canvas.init_view( data )
        data.move( new Point( - NODE_RADIUS, - NODE_RADIUS ) )
        insertions.push( new Insertion( bst.root, data ) )
    })

    //nodes currently trying to find their place to get inserted (animating) - not part of target tree yet:
    const insertions : Insertion[] = []
    streams.s( 'tick' ).on( seconds => {
        for ( let i = 0; i < insertions.length; ++ i ) {
            const ins = insertions[ i ]
            step( ins, bst, canvas, seconds )
            if ( ! ins.data ) {
                insertions.splice( i, 1 )
                -- i
            }
        }
    })
}

function insert( canvas : Canvas, bst : BST<Data>, data : Data ) {
    canvas.add_view( data )
    
    bst.insert(
        data.key,
        data,
    )
    insert_graphics(
        bst,
        data.key,
    )
}

class Insertion {
    /** Nearest node this insertion is currently animating to.*/
    target_key : number

    data : Data

    constructor( root : Node<Data> | undefined, data : Data ) {
        this.target_key = root ? root.key : data.key
        this.data = data
    }
}
function step(
    insertion : Insertion,
    bst : BST< Data >,
    canvas : Canvas,
    seconds : number,
) {
    //locating the position of the node this insertion is currently moving to:
    const caret = new Caret
    let node = bst.root
    caret.move()
    while ( node ) {
        //target_key node could be removed during the insertion animation:
        if ( insertion.data.key == node.key ) {
            insertion.target_key = node.key
            break
        }
        if ( insertion.target_key == node.key ) {
            break
        }

        //tree was modified during the animation so that current animation will never reach it's proper destination:
        if ( Math.sign( insertion.target_key - node.key ) != Math.sign( insertion.data.key - node.key ) ) {
            insertion.target_key = bst.root.key
            node = bst.root
            break
        }

        if ( insertion.target_key < node.key ) {
            caret.turn_left()
            node = node.left
        }
        else {
            caret.turn_right()
            node = node.right
        }
        
        caret.move()
    }

    if ( move( insertion.data, caret, seconds ) ) {
        //inserting node reached the current [intermediate] target: switching to next child:
        if ( node && node.key != insertion.data.key ) {
            if ( insertion.data.key < node.key ) {
                insertion.target_key = node.left ? node.left.key : insertion.data.key
            }
            else {
                insertion.target_key = node.right ? node.right.key : insertion.data.key
            }
        }
        //inserting node reached the position where it belongs: inserting:
        else {
            insertion.data.view.clear()
            insert( canvas, bst, insertion.data )
            delete insertion.data
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
        }
    }
    if ( target.pos.x < pos.x ) {
        pos.x -= movement
        if ( pos.x < target.pos.x ) {
            pos.x = target.pos.x
        }
    }
    if ( pos.x == target.pos.x )
        x_reached = true

    if ( target.pos.y > pos.y ) {
        pos.y += movement
        if ( pos.y > target.pos.y ) {
            pos.y = target.pos.y
        }
    }
    if ( target.pos.y < pos.y ) {
        pos.y -= movement
        if ( pos.y < target.pos.y ) {
            pos.y = target.pos.y
        }
    }
    if ( pos.y == target.pos.y )
        y_reached = true
    
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
    node.value.view.center( caret.pos.x, caret.pos.y )

    if ( parent ) {
        node.value.edge
            .line(
                parent.value.pos.x,
                parent.value.pos.y,
                caret.pos.x,
                caret.pos.y,
            )
            .stroke({
                width: 4,
                color : 'black',
            })
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

let lastTime = Date.now()
function animate( streams : Streams ) {
    requestAnimationFrame( () => animate( streams ) )
    const now = Date.now()
    const dt = now - lastTime
    lastTime = now
    streams.s( 'tick' ).next( dt / 1000 )
}
