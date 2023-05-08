globalThis.N = 1000;
globalThis.x_array = linspace(-100,100,N)
globalThis.y_array = [];

function linspace(a,b,n) {
    var d = (b-a)/n;
    var ans = [];
    for(var i=0;i<n;i++){
        ans.push(a+(i+1)*(d));
    }
    return ans;
}
var mychart;
var inUse = false;

function update_string(expression){
   expression=expression.replaceAll('^','**');
   expression=expression.replaceAll('sin','math.sin');
   expression=expression.replaceAll('cos','math.cos');
   expression=expression.replaceAll('tan','math.tan');
   expression=expression.replaceAll('cot','math.cot');
   expression=expression.replaceAll('log','math.log');
   expression=expression.replaceAll('e','math.e');
   return expression;
}

function getCurve() {
  x_array = linspace(-10,10,N)
  y_array = [];
  console.log(document.getElementById("result"))
  var expression = document.getElementById("result").innerHTML;
  var temp_expression=expression
  expression=update_string(expression)
  console.log(expression);
  console.log(inUse);
  if (inUse){
      mychart.destroy();
  }
  for(let i=0;i<N;i++){
      x = x_array[i];
      var box=document.getElementById("msg");
      try{
        y_array.push(eval(expression));
        box.innerHTML="The Curve f(x)="+temp_expression+". Click on the point to get tangent of the curve at that point";
      }
      catch (error){
        box.innerHTML=String(error);
      }
  }
  console.log(y_array);
  plot(x_array,y_array,temp_expression);
}

function plot(x,y,expression) {
    var grapharea = document.getElementById("myChart").getContext("2d");
    mychart = new Chart(grapharea, {
        mode: "markers",
        type: "line",
        data: {
          labels: x,
          datasets: [{ 
            data: y,
            borderColor: "rgba(255,0,0,0.5)",
            pointRadius: 2,
            fill: false
          }]
        },
        options: {
          title: {
            display: true,
            text: expression,
            fontSize: 16
          },
          legend: {display: false},
          onClick: (e) => {
            console.log("start")
            var expression = document.getElementById("result").innerHTML;
            var y_tangent = [];
           // var y_nrml = [];
            var temp_expression=expression;
            console.log("expression=",expression);
            var element = mychart.getElementsAtEvent(e);
            console.log(element)
            let index = element[0]._index
            console.log("index=",index)
            console.log("x,y=",x_array[index],y_array[index])
            var slope=math.derivative(expression, 'x').evaluate({x: x_array[index]});
            expression = update_string(expression)
            var c =  y_array[index]-slope*x_array[index]
            for (let i=0;i<N;i++){
              y_tangent.push(slope*x_array[i]+c)
            }
            tangent_expression="<b>"+String(slope.toFixed(3))+"*x + "+String(c.toFixed(3))+"</b>";
            var nrml_slope = -(1/slope);
            var nrml_c = y_array[index]-nrml_slope*x_array[index];
            nrml_equation="<b>"+String(nrml_slope.toFixed(3))+"*x + "+String(nrml_c.toFixed(3))+"</b>"
            msgBox_expr(temp_expression,tangent_expression,[x_array[index],y_array[index]],nrml_equation,slope)
          
            update(y_tangent);
        }
        }
      });
      inUse = true;
}

function update(y_tangent) {
  let tangent = {
    data: y_tangent,
    borderColor: "green",
    pointRadius: 1,
    fill: false
  }
  if (mychart.data.datasets.length==2) {
    mychart.data.datasets[1]=tangent
  }
  else{
    mychart.data.datasets.push(tangent);
  }
  mychart.update();
}

function msgBox_expr(curve_expression,tangent_expression,coordinates,nrml_equation,slope){
  var msg=document.getElementById("msg");
  message = "The equation of curve is "+curve_expression+" and the tangent at the point "+"("+"<b>"+coordinates[0]+"</b>"+","+"<b>"+coordinates[1]+"</b>"+") is y = "+tangent_expression+" slope is ("+String(slope)+") and the normal is y = "+nrml_equation;
  msg.innerHTML=message;
}