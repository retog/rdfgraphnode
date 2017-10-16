# GraphNodeJS
Graph Traversal on top of [rdflib.js](https://github.com/linkeddata/rdflib.js)

## API

A GraphNode represents one or several nodes in a graph. 

A GraphNode has the following properties:

- value
- termType
- node
- nodes
- graph

The first three properties are available only if the GraphNode represeents 
exactly one node.

A GraphNode has the following methods:

- out(predicate)
- in(predicate)
- fetch()
- each()

All ths methods return a Promise for a GraphNode.

## Example

```
GraphNode($rdf.sym("https://reto.solid.factsmission.com:8443/public/")).fetch().then(folder =>
    { folder.out($rdf.sym("http://www.w3.org/ns/ldp#contains")).each(contained =>
        { console.log(contained.value) });
    });
```
