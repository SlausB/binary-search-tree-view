import am4chart_tree from './am4chart_tree'
import g6_force_tree from './g6_force_tree'
import Streams from '@slaus/simple_streams/lib/space'

console.log('Hello, binary-search-tree-view!')

const streams = new Streams

document.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        streams.s( 'spacebar' ).next( event )
    }
})

//am4chart_tree( streams )
g6_force_tree()