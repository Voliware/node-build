class Foo {
    bar(){
        let x = {};
        x.a = 1;
        x.b = {};
        x.b.a = 1;
        return x;
    }
}