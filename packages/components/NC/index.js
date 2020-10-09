import NC from './NC';
NC.install = function(vue) {
    vue.component(NC.name, NC);
}

export default NC;
