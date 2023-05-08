document.addEventListener("DOMContentLoaded", function(event) {
    let body = document.querySelector('body');
    let result = document.querySelector('#result');
    
   // let dark_mode_btn = document.querySelector('.dark_mode_btn');
    let clear = document.querySelector('#clear');
   // let history = document.querySelector('#history');
    let equalTo = document.querySelector('#equalTo');
    let delete_single_num = document.querySelector('#delete_single_num');
    
    let Normal_btn = document.querySelectorAll('#Normal_btn');
    
    
    let initial_value = "";
    
    Normal_btn.forEach((Normal_btn, index)=>{
    Normal_btn.addEventListener('click', function(){
    let text = this.innerHTML;
    initial_value += text;
    result.innerHTML = initial_value;
    });
    });
    
    /clear all number/
    clear.addEventListener('click', function(){
    result.innerHTML = "";
    initial_value = "";
    });
    
    /delete single number/
    delete_single_num.addEventListener('click', function(){
    result.innerHTML = result.innerHTML.substring(0,result.innerHTML.length-1);
    initial_value = result.innerHTML;
    });
    
    });