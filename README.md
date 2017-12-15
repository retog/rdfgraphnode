# GraphNodeJS
Graph Traversal on top of [rdflib.js](https://github.com/linkeddata/rdflib.js)

## API

A GraphNode represents an arbitrary number of nodes in a graph. 

A GraphNode has the following properties:

- value
- termType
- node
- nodes
- graph

The first three properties are available only if the GraphNode represents 
exactly one node.

A GraphNode has the following methods:

- out(predicate)
- in(predicate)
- fetch()
- each(f)
- fetchEach(f)

The first three methods return a Promise for a GraphNode.The `each(f)`method invokes `f` once for every represented node with a GrahphNode representing that node as argument and returns a promise that is satisfied when all promises returned by f are resolved. The method `fetchEach(f)` is identical to `each(f)` but every node is fetched before being passed to `f`.

## Example

```
GraphNode($rdf.sym("https://reto.solid.factsmission.com:8443/public/")).fetch().then(folder =>
    { folder.out($rdf.sym("http://www.w3.org/ns/ldp#contains")).each(contained =>
        { console.log(contained.value) });
    });
```
