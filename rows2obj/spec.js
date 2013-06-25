var rows2obj = require('./rows2obj.js');

describe("rows2obj", function() {
    it("should group by main objects", function() {
        var obj0 = {id: 0, name: 'hoge', childId: 0, childName: 'foo', };
        var obj1 = {id: 0, name: 'hoge', childId: 1, childName: 'bar', };
        var obj2 = {id: 1, name: 'fuga', childId: 0, childName: 'foo', };
        var obj3 = {id: 1, name: 'fuga', childId: 1, childName: 'bar', };
        var obj4 = {id: 0, name: 'hoge', childId: 2, childName: 'baz', };
        
        var rows = [obj0, obj1, obj2, obj3, obj4];
        var result = rows2obj.group(rows, 'id', 'name');
        
        expect(result.length).toEqual(2);
        expect(result[0][0].id).toEqual(0);
        expect(result[0][0].name).toEqual('hoge');
        expect(result[0][1].length).toEqual(3);
        expect(result[0][1][0].childId).toEqual(0);
        expect(result[0][1][0].childName).toEqual('foo');
        expect(result[0][1][1].childId).toEqual(1);
        expect(result[0][1][1].childName).toEqual('bar');
        expect(result[0][1][2].childId).toEqual(2);
        expect(result[0][1][2].childName).toEqual('baz');
        
        expect(result.length).toEqual(2);
        expect(result[1][0].id).toEqual(1);
        expect(result[1][0].name).toEqual('fuga');
        expect(result[1][1].length).toEqual(2);
        expect(result[1][1][0].childId).toEqual(0);
        expect(result[1][1][0].childName).toEqual('foo');
        expect(result[1][1][1].childId).toEqual(1);
        expect(result[1][1][1].childName).toEqual('bar');
    });

    it("does not matter if all fields are filled or not", function() {
        var obj0 = {id: 0, name: '',     childId: 0, childName: 'foo' };
        var obj1 = {id: 0, name: '',                 childName: 'bar' };
        var obj2 = {id: 1,               childId: 0, childName: ''    };
        var obj3 = {id: 1,               childId: 1,                  };
        var obj4 = {id: 0, name: ''                                   };
        
        var rows = [obj0, obj1, obj2, obj3, obj4];
        
        var result = rows2obj.group(rows, 'id', 'name');
        
        expect(result.length).toEqual(2);
        expect(result[0][0].id).toEqual(0);
        expect(result[0][0].name).toEqual('');
        expect(result[0][1].length).toEqual(3);
        expect(result[0][1][0].childId).toEqual(0);
        expect(result[0][1][0].childName).toEqual('foo');
        expect(result[0][1][1].childId).toBeFalsy();
        expect(result[0][1][1].childName).toEqual('bar');
        expect(result[0][1][2].childId).toBeFalsy();
        expect(result[0][1][2].childName).toBeFalsy();
        
        expect(result.length).toEqual(2);
        expect(result[1][0].id).toEqual(1);
        expect(result[1][0].name).toBeFalsy();
        expect(result[1][1].length).toEqual(2);
        expect(result[1][1][0].childId).toEqual(0);
        expect(result[1][1][0].childName).toEqual('');
        expect(result[1][1][1].childId).toEqual(1);
        expect(result[1][1][1].childName).toBeFalsy();
    });
});