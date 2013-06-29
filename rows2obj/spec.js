var rows2obj = require('./rows2obj.js');

describe("rows2obj", function() {

    it("should group by CoC rules", function() {
        
        var obj0 = {id: 0, name: 'hoge', children$id: 0, children$name: 'foo', };
        var obj1 = {id: 0, name: 'hoge', children$id: 1, children$name: 'bar', };
        var obj2 = {id: 1, name: 'fuga', children$id: 0, children$name: 'foo', };
        var obj3 = {id: 1, name: 'fuga', children$id: 1, children$name: 'bar', };
        var obj4 = {id: 0, name: 'hoge', children$id: 2, children$name: 'baz', };
        
        var rows = [obj0, obj1, obj2, obj3, obj4];
        var result = rows2obj.group(rows);
        
        expect(result.length).toEqual(2);
        
        expect(result[0].id).toEqual(0);
        expect(result[0].name).toEqual('hoge');
        expect(result[0].children.length).toEqual(3);
        expect(result[0].children[0].id).toEqual(0);
        expect(result[0].children[0].name).toEqual('foo');
        expect(result[0].children[1].id).toEqual(1);
        expect(result[0].children[1].name).toEqual('bar');
        expect(result[0].children[2].id).toEqual(2);
        expect(result[0].children[2].name).toEqual('baz');
        
        expect(result[1].id).toEqual(1);
        expect(result[1].name).toEqual('fuga');
        expect(result[1].children.length).toEqual(2);
        expect(result[1].children[0].id).toEqual(0);
        expect(result[1].children[0].name).toEqual('foo');
        expect(result[1].children[1].id).toEqual(1);
        expect(result[1].children[1].name).toEqual('bar');
    });
    
    
    it("does not matter if all fields are filled or not", function() {
        
        var obj0 = {id: 0,               children$id: 0, children$name: ''    };
        var obj1 = {id: 0,               children$id: 1,                      };
        var obj2 = {id: 1, name: ''                                           };
        var obj3 = {id: 1, name: '',     children$id: 0, children$name: 'foo' };
        var obj4 = {id: 1, name: '',                     children$name: 'bar' };
        
        var rows = [obj0, obj1, obj2, obj3, obj4];
        
        var result = rows2obj.group(rows);
        
        expect(result.length).toEqual(2);
        
        expect(result[0].id).toEqual(0);
        expect(result[0].name).toBeFalsy();
        expect(result[0].children.length).toEqual(2);
        expect(result[0].children[0].id).toEqual(0);
        expect(result[0].children[0].name).toEqual('');
        expect(result[0].children[1].id).toEqual(1);
        expect(result[0].children[1].name).toBeFalsy();
        
        expect(result[1].id).toEqual(1);
        expect(result[1].name).toEqual('');
        expect(result[1].children.length).toEqual(2);
        expect(result[1].children[0].id).toEqual(0);
        expect(result[1].children[0].name).toEqual('foo');
        expect(result[1].children[1].id).toBeFalsy();
        expect(result[1].children[1].name).toEqual('bar');
    });
    
    
    it("should distinct partially different objects", function() {
        
        var obj0 = {id: 0, name: 'hoge', children$id: 0, children$name: 'foo', };
        var obj1 = {id: 0, name: 'fuga', children$id: 1, children$name: 'bar', };
        var obj2 = {id: 1, name: 'hoge', children$id: 0, children$name: 'foo', };
        var obj3 = {id: 1, name: 'fuga', children$id: 1, children$name: 'bar', };
        var obj4 = {id: 0, name: 'hoge', children$id: 2, children$name: 'baz', };
        
        var rows = [obj0, obj1, obj2, obj3, obj4];
        var result = rows2obj.group(rows);
        
        expect(result.length).toEqual(4);
    });
});