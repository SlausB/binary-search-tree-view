import my_layout from './my_layout'
import Streams from '@slaus/simple_streams/lib/space'

console.log('Hello, binary-search-tree-view!')

const streams = new Streams

window.addEventListener('resize', function(event) {
    streams.s( 'resize' ).next()
}, true)

document.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        streams.s( 'spacebar' ).next( event )
    }
})

my_layout( streams )
