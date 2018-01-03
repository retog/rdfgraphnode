"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Node Status:
 * 
 * Locally undetermined: There are multiple local nodes satisfying the criteria specified for this object 
 * Blank: The object represents a blank node in a graph that is locally available
 * Unresolved: This node is identified by a URI that has not yet been derefernced
 * 
 * @type type
 */
if (typeof $rdf === 'undefined') {
    $rdf = require("rdflib");
}

function GraphNode() {
    return new (Function.prototype.bind.apply(GraphNode.Impl, [null].concat(Array.prototype.slice.call(arguments))))();
}

GraphNode.Impl = function () {
    function _class(nodes, graph, sources) {
        _classCallCheck(this, _class);

        this._graph = graph;
        if (Array.isArray(nodes)) {
            this.nodes = nodes;
            /*if (this.nodes.length === 0) {
                throw "Can't represent empty set of nodes";
            }*/
        } else {
            this.nodes = [nodes];
        }
        this.sources = sources;
    }

    _createClass(_class, [{
        key: "fetch",
        value: function fetch() {
            var _this = this;

            if (this.termType !== "NamedNode" || this.sources && this.sources.indexOf(this.value.split("#")[0]) > -1) {
                return Promise.resolve(this);
            } else {
                //TODO extend existing graph?
                var uri = this.value.split("#")[0];
                return GraphNode.rdfFetch(uri).then(function (response) {
                    return GraphNode(_this.node, response.graph, [uri]);
                });
            }
        }

        /*
         * 
         * @param {type} f
         * @returns {unresolved} a promise thta is satisfied whne all promises returned by f are resolved
         */

    }, {
        key: "each",
        value: function each(f) {
            var _this2 = this;

            var results = this.nodes.map(function (node) {
                return f(GraphNode([node], _this2.graph, _this2.sources));
            });
            return Promise.all(results);
        }
    }, {
        key: "fetchEach",
        value: function fetchEach(f) {
            var _this3 = this;

            var results = this.nodes.map(function (node) {
                return GraphNode([node], _this3.graph, _this3.sources).fetch().then(f);
            });
            return Promise.all(results);
        }
    }, {
        key: "out",
        value: function out(predicate) {
            var nodes = this.graph.each(this.node, predicate);
            /*if (nodes.length === 0) {
                throw "No property "+predicate+" on "+this.node;
            }*/
            return GraphNode(nodes, this.graph, this.sources);
        }
    }, {
        key: "in",
        value: function _in(predicate) {
            var statements = this.graph.statementsMatching(undefined, predicate, this.node);
            /*if (statements.length === 0) {
                throw "No property "+predicate+" pointing to "+this.node;
            }*/
            return GraphNode(statements.map(function (statement) {
                return statement.subject;
            }), this.graph, this.sources);
        }
    }, {
        key: "graph",
        get: function get() {
            if (!this._graph) {
                throw Error("Operation not possible as no Graph is available, try fetching first");
            }
            return this._graph;
        }
    }, {
        key: "node",
        get: function get() {
            if (this.nodes.length !== 1) {
                throw Error("Operation not possible as this GraphNode is underdetermined");
            }
            return this.nodes[0];
        }
    }, {
        key: "termType",
        get: function get() {
            return this.node.termType;
        }
    }, {
        key: "value",
        get: function get() {
            ;
            return this.node.value;
        }
    }]);

    return _class;
}();

/**
 * 
 * Fetches an RDF graph. If the server return 401 the login process will be 
 * started upon which the fetch will be retried.
 *
 * @param uri {string} The URI to be fetched
 * @param options passed to $rdf.Fetcher
 * @param login {boolean} The login function to be called, optional
 *
 * @return {Promise<Response>} Response has a `graph`property with the rertived graph
 */
GraphNode.rdfFetch = function (uri, options, login) {
    var ggg = this;
    return new Promise(function (resolve, reject) {
        var graph = $rdf.graph();
        var fetcher = new $rdf.Fetcher(graph, options);
        fetcher.fetch(uri, {
            "redirect": "follow"
        }).then(function (response) {
            if (response.status < 300) {
                response.graph = graph;
                resolve(response);
            } else {
                if (login && response.status === 401) {
                    console.log("Got 401 response, attempting to login");
                    return login().then(function () {
                        return ggg.rdfFetch(uri);
                    });
                } else {
                    reject(response);
                }
            }
        });
    });
};

if (typeof module !== 'undefined') {
    module.exports = GraphNode;
}