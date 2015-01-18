/**
 * Created by gabriel on 30.11.14.
 */

var chai = require('chai');
var expect = chai.expect;

var async = require('async');

var db = require('./utils/db');

var edges = require('../src/index');
var Edge = require('../src/model/edge');

function createEdge() {
    return {
        src: db.mongoose.Types.ObjectId(),
        dest: db.mongoose.Types.ObjectId(),
        props: {
            friend: Math.random() < .5,
            foe: Math.random() < .5
        }
    }
}

describe('mongoose-edges', function () {
    before(db.connect);
    after(db.disconnect);

    beforeEach(function(done) {
        Edge.remove(done);
    });

    describe('#setProperties', function() {

        it('should insert edge in case it does not exist yet', function(done) {
            var edge = createEdge();

            async.series([
                // make sure no edge is in db
                function(cb) {
                    Edge.find(function(err, edges) {
                        expect(edges).to.be.empty();
                        cb();
                    });
                },
                // set properties
                function(cb) {
                    edges.setProperties(edge, cb);
                },
                // check edge has been inserted
                function(cb) {
                    Edge.findOne({
                        uniqueIndex: edge.src+":"+edge.dest
                    }, function(err, edge) {
                        expect(edge).to.exist();
                        cb();
                    });
                },
            ], done);
        });

        it('should create new properties', function(done) {
            var edge = createEdge();

            async.series([
                // set properties
                function(cb) {
                    edges.setProperties(edge, cb);
                },
                // check edge has new properties
                function(cb) {
                    Edge.findOne({
                        uniqueIndex: edge.src+":"+edge.dest
                    }, function(err, edge) {
                        expect(edge.props.friend).to.be.exist();
                        expect(edge.props.foe).to.be.exist();
                        cb();
                    });
                },
            ], done);
        });

        it('should overwrite existing properties', function(done) {
            var edge = createEdge();
            edge.props.friend = true;

            async.series([
                // set properties
                function(cb) {
                    edges.setProperties(edge, cb);
                },
                // check edge has property
                function(cb) {
                    Edge.findOne({
                        uniqueIndex: edge.src+":"+edge.dest
                    }, function(err, edge) {
                        expect(edge.props.friend).to.be.true();
                        cb();
                    });
                },
                // set friend to false
                function(cb) {
                    edge.props.friend = false;
                    edges.setProperties(edge, cb);
                },
                // check property has new value
                function(cb) {
                    Edge.findOne({
                        uniqueIndex: edge.src+":"+edge.dest
                    }, function(err, edge) {
                        expect(edge.props.friend).to.be.false();
                        cb();
                    });
                },
            ], done);
        });

        it('should callback with null if there is no error', function(done) {
            var edge = createEdge();

            async.series([
                // set properties
                function(cb) {
                    edges.setProperties(edge, function(err) {
                        expect(err).to.be.null();
                        cb();
                    });
                },
                // check that there has been no error
                function(cb) {
                    Edge.findOne({
                        uniqueIndex: edge.src+":"+edge.dest
                    }, function(err, edge) {
                        expect(edge).to.exist();
                        cb();
                    });
                },
            ], done);
        });
    });

    describe('#getProperties', function() {

        it('should return all properties if given edge has no props', function(done) {
            var edge = createEdge();

            async.series([
                // set properties
                function(cb) {
                    edges.setProperties(edge, function(err) {
                        cb(err);
                    });
                },
                // delete edge.props and check if getProperties return all properties
                function(cb) {
                    delete edge.props;

                    edges.getProperties(edge, function (err, edge){
                        expect(edge.props.friend).to.exist();
                        expect(edge.props.foe).to.exist();
                        cb();
                    });
                },
            ], done);
        });

        it('should return all properties given in edge.props', function(done) {
            var edge = createEdge();

            async.series([
                // set properties
                function(cb) {
                    edges.setProperties(edge, function(err) {
                        cb(err);
                    });
                },
                // check if getProperties returns all given properties
                function(cb) {
                    delete edge.props.foe;

                    edges.getProperties(edge, function (err, edge){
                        expect(edge.props.friend).to.exist();
                        expect(edge.props.foe).not.to.exist();
                        cb();
                    });
                },
            ], done);
        });
    });

    describe('#removeProperties', function() {

        it('should remove all properties if given edge has no props', function(done) {
            var edge = createEdge();

            async.series([
                // set properties
                function(cb) {
                    edges.setProperties(edge, function(err) {
                        cb(err);
                    });
                },
                // delete props from edge and call removeProperties
                function(cb) {
                    delete edge.props;

                    edges.removeProperties(edge, cb);
                },
                // check if all properties were removed
                function(cb) {

                    edges.getProperties(edge, function (err, edge){
                        expect(edge.props).not.to.exist();
                        cb();
                    });
                },
            ], done);
        });

        it('should remove all properties given in edge.props', function(done) {
            var edge = createEdge();

            async.series([
                // set properties
                function(cb) {
                    edges.setProperties(edge, function(err) {
                        cb(err);
                    });
                },
                // delete props from edge and call removeProperties
                function(cb) {
                    delete edge.props.foe;
                    edges.removeProperties(edge, cb);
                },
                // check if all properties were removed
                function(cb) {

                    delete edge.props;

                    edges.getProperties(edge, function (err, edge){
                        expect(edge.props.foe).to.exist();
                        expect(edge.props.friend).not.to.exist();
                        cb();
                    });
                },
            ], done);
        });
    });

    describe('#findEdges', function() {

        it('should return all fields if query specifies no props', function (done) {
            var edge = createEdge();

            async.series([
                // set properties
                function(cb) {
                    edges.setProperties(edge, function(err) {
                        cb(err);
                    });
                },
                // check if all properties are returned
                function(cb) {
                    delete edge.props;

                    edges.findEdges(edge, function (err, edges){
                        var edge = edges[0];
                        expect(edge.props.foe).to.exist();
                        expect(edge.props.friend).to.exist();
                        cb();
                    });
                },
            ], done);
        });

        it('should return all fields which are specified by props', function (done) {
            var edge = createEdge();

            async.series([
                // set properties
                function(cb) {
                    edges.setProperties(edge, function(err) {
                        cb(err);
                    });
                },
                // check if properties specified in props are returned
                function(cb) {
                    delete edge.props.foe;

                    edges.findEdges(edge, function (err, edges){
                        var edge = edges[0];
                        expect(edge.props.foe).not.to.exist();
                        expect(edge.props.friend).to.exist();
                        cb();
                    });
                },
            ], done);
        });

        it('should return only edges that match src, dest and find', function (done) {
            var n = 10;
            var fistEdges =[];
            for(var i = 0; i < n; i++) {
                fistEdges[i] = createEdge();
            }

            async.series([
                // add edges
                function (cb) {
                    async.times(n, function(n, cb) {
                        edges.setProperties(fistEdges[n], function(err) {
                            cb(err);
                        });
                    }, cb);
                },
                // test find
                function(cb) {
                    var query = {
                        find: {
                            friend: {
                                $ne: true
                            }
                        }
                    }
                    edges.findEdges(query, function (err, edges){
                        expect(edges).to.have.length.below(n);
                        cb();
                    });
                },
            ], done);
        });
    });
});