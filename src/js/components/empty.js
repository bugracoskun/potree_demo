Vue.component('empty', {
	data:function(){
		return this.setDefault();
  },
  methods:{
      setDefault:function(){
          // Inputs
          return {
              onoff:true
          }
      },
      open:function(){
        this.onoff = true;
      },
      close:function(e){
        this.onoff = false;
      }
  },
  template:
  '<div v-if="onoff">'+
  
  '</div>'
  });

var empty = new Vue({ el: '#empty' });