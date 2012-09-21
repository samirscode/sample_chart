/**
 * A class to Draw custom social chart using hemispheres and edges.
 * @author Mohamed Samir <mohamedsamir216@gmail.com>
 * @Date Started June 24 2012 
 * @license Client Free to use it and distribute it for commercial purposes
 */


//__________________________________________*Global Variables*____________________________________________

var spacing             = 2
    ,intialShift        = 200
    ,yShift             = 450
    ,paper
    ,background
    ,paperWidth         = 3000    
    ,paperHeight        = 700
    ,low_color          = "#CCCCCC"
    ,medium_color       = "gray"
    ,high_color         = "black"
    ,negative_color     = "#ee0000"//red
    ,positve_color      = "#00bb00"//green
    ,neutral_color      = "#ffff00"//yellow
    ,low_edge_width     = 1.5
    ,medium_edge_width  = 3.5
    ,high_edge_width    = 5.5
    ,min_chart_value    = 20
    ,max_chart_value    = 130
    ,radix              = 0
    ;

//_______________________________________________*Methods*__________________________________________________

$(document).ready(function () {
    
});  


/*
    First called function to initialize the paper and hidden image to be downloaded any time
    to export the SVG canvas to PNG formated image
*/
function init(width,hight){
    $('#download').hide();
    $('#canvas').hide();
    $('#downloadBtn').click(function(){
        download();
    });
    paper = Raphael("holder", paperWidth,paperHeight);
    background =paper.rect(0,0,paperWidth,paperHeight);
    background.attr("fill","white");
    background.attr("stroke-width",.01);

    var JSONArray = jQuery.parseJSON($('#JSONBox').val().replace(/\s/g, ""));
    draw(paper,JSONArray);
}




/*
    Using Canvg JS library to convert the rapael chart to canvas 
    to be able to put its data into image using the canvas [toDataURL] method
    then submit the form to backend php script to force the image download

*/
function download(){
    //TODO:resize raphael paper to capture the part of the big canvas that has the chart drawn then return it back to its size
    canvg(document.getElementById('canvas'), $('#holder').html());
    var canvas = document.getElementById("canvas");
    var img    = canvas.toDataURL("image/png");              
    $('#download').attr('src',img);
    img= img.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    $("#fname").val(img);
    $('#downform').submit();
}





/*
 Draw the chart using Pie,Secotr,drawArc methods by drawing the given JSON data
 nodes edges then hemispheres then Vertical/Horizontal legends and topics names
 Drawing Steps:
 --------------
        - Draw arcs first to be hided in step 2 by hemispheres
        - Draw hemispheres
        - Draw Vertical and Horizontal Legends
        - Draw Topics Names by alternating between even and odds of them high and low 
*/
function draw(paper,JSONArray){
    var chartId =JSONArray.id;
    var nodes   =JSONArray.nodes;
    var edges   =JSONArray.edges;

    var maxNodeValue=getMaxInRange(nodes,0,nodes.length-1)
       ,minNodeValue=getMinNodeValue(nodes);
    
    //scale node to draw vertically in the chart but keeping the old min max 
    nodes = scaleNodes(nodes,maxNodeValue,minNodeValue);
    radix =getRadix(nodes.length);
    //Prepare Nodes for drawing calculating internal paramters and set it
    var values = [],
        labels = [];
    var r,cx,top;
    for (var i = 0 ; i < nodes.length; i++) {
        nodes[i].idx =i;
        r  =nodes[i].size;
        if(i==0){
            cx = r + intialShift;
        }else{
            cx = nodes[i-1].cx + r+ nodes[i-1].r +spacing;
        }
        nodes[i].cx = cx;
        nodes[i].r  = r;
        top = yShift - nodes[i].r;
        nodes[i].top = top;
        
        values=[];
        labels=[];

        values.push(nodes[i].sentiment_dist.negative);
        values.push(nodes[i].sentiment_dist.neutral);
        values.push(nodes[i].sentiment_dist.positive);

        labels.push(negative_color);
        labels.push(neutral_color);
        labels.push(positve_color);
        
        nodes[i].values=values;
        nodes[i].labels=labels;
    };


    //draw edges first to get them behind nodes
    for (var i = 0 ; i < edges.length; i++) {
        var startNode = getNodeByName(nodes,edges[i].node_pair.node1);
        var endNode   = getNodeByName(nodes,edges[i].node_pair.node2);
        var strength  = edges[i].node_pair.strength;
        if(startNode.idx < endNode.idx){
            drawArc(startNode.cx,endNode.cx,startNode.top,endNode.top,strength,getMaxInRange(nodes,startNode.idx,endNode.idx));
        }else{
            drawArc(endNode.cx,startNode.cx,endNode.top,startNode.top,strength,getMaxInRange(nodes,startNode.idx,endNode.idx));
        }
        
    }


    //draw nodes
    for (var i = 0 ; i < nodes.length; i++) {
         paper.pieChart(nodes[i].cx, yShift, nodes[i].r, nodes[i].values, nodes[i].labels, "#fff");
    }

    // draw half ellipse hider space
    paper.rect(0,yShift,paperWidth,yShift+5000).attr({fill:"white","stroke-width": .0,"stroke":"white"});
    

    // draw the topics names done in separate step to be behind the hider space
    for (var i = 0 ; i < nodes.length; i++) {
        if(i%2 == 0){
            paper.text(nodes[i].cx, yShift+22, nodes[i].name).attr({"font-size": 16});
        }else{
            paper.text(nodes[i].cx, yShift+45, nodes[i].name).attr({"font-size": 16});
            drawLine(nodes[i].cx, yShift, nodes[i].cx, yShift+35 ,Array());
        } 
    }


    //draw vertical axis
    /*
        --Deleted--
         drawVAxis(maxNodeValue);
    */

    //finally draw the bottom legend
     drawBottomLegend();


}

/*
    Get the height of edges according to the count of nodes
*/
function getRadix(NodesCount){
    if(NodesCount>7 && NodesCount<18)return 35;
    else if(NodesCount>18)return 100;
    else return 0;
}

/*
    Draw Legend of the chart 
*/
function drawBottomLegend(){
    var downChart  =62;
    var leftMargin = 195;
    paper.image('imgs/legend.png',leftMargin,yShift+downChart,446,131);
}



/*
    Draw the vertical axis  [legend]
*/
function drawVAxis(maxNodeValue){
    intialShift = intialShift +3;
    drawLine(intialShift/2, yShift, intialShift/2, yShift-max_chart_value);
    
    drawLine(intialShift/2, yShift, (intialShift/2)-7, yShift);
    paper.text(intialShift/2-12, yShift-2, "0").attr({"font-size": 12,"font-weight":"bold"});

    drawLine(intialShift/2, yShift- (max_chart_value/2), (intialShift/2)-7, yShift- (max_chart_value/2));
    paper.text(intialShift/2-20, yShift-2 -(max_chart_value/2), ""+(maxNodeValue/2)).attr({"font-size": 12,"font-weight":"bold"});

    drawLine(intialShift/2, yShift- (max_chart_value), (intialShift/2)-7, yShift- (max_chart_value));
    paper.text(intialShift/2-20, yShift-2 -(max_chart_value), ""+(maxNodeValue)).attr({"font-size": 12,"font-weight":"bold"});
}




/*
    Get Max node size in given range to know till what 
    the trajectory edge can go low , inorder not to be 
    behind one of the in between nodes
*/
function getMaxInRange(nodes,startIdx,endIdx){
    //swap if switched range ex: instead of 1 to 7 sent 7,1
    if(endIdx <startIdx){
        var tmp  = startIdx;
        startIdx =endIdx;
        endIdx   = tmp;
    }
    var max = 0;
    
    for (var i = startIdx ; i <= endIdx; i++) {
        if(nodes[i].size > max)max=nodes[i].size;
    }
    return max;
}




/*
    Simple function to get min value in nodes list
*/
function getMinNodeValue(nodes){
    var min =9007199254740992; //MAX INT value 2^32
    for (var i = 0 ; i < nodes.length; i++) {
        if(nodes[i].size < min)min=nodes[i].size;
    }
    return min;
}




/*
    Search in nodes and return node has targeted name
*/
function getNodeByName(nodes,targetName){
    
    for (var i = 0 ; i < nodes.length; i++) {
        if(nodes[i].name == targetName)return nodes[i]; 
    }
    return "";
}



/*
    Scale node values to be drawn in range [20 - 100] 
    before drawing the vertical axis
    Nodes Range [min,max] to chart range [a,b]

               (b-a)(x - min)
        f(x) = --------------  + a
                 max - min
*/
function scaleNodes(nodes,max,min){
    var a = min_chart_value;
    var b = max_chart_value;
    var x;

    for (var i = 0 ; i < nodes.length; i++) {
        x  =nodes[i].size;
        fx = ( ( ( b - a ) * ( x - min ) ) / (max - min ) ) + a;
        nodes[i].size = fx;
    }

    return nodes;
}




/*
    Add max functionality to javascript Array
*/
Array.prototype.max = function() {
    var max = this[0];
    var len = this.length;
    for (var i = 1; i < len; i++) if (this[i] > max) max = this[i];
    return max; 
}






/*
    Draw arc using custmized ellipse equation to tangent the 2 highest points of 
    hemisphere.
    Ellipse Params are ellipse(Center , Rx ,Ry)
    RSQ     = Root of square
    Rx      = RSQ(x2-x1) /2
    RY      = RSQ(y2-y1) * (Y spacing to be over all inbetween hemispheres in between the 2 targeted hemispheres)
    Center  = (x1 + Rx , y1)
*/
function drawArc(cx1,cx2,cy1,cy2,strength,maxInbetween){
    if(cy1==cy2)cy2--;//small adjustment
    var rx1         = Math.sqrt(Math.pow((cx2-cx1),2))/2;
    var check       = 1;
    var ry1         = Math.sqrt(Math.pow((cy1-cy2),2))*check;
    var randExt     = radix;
    var color       = high_color;   //highst value
    var edgeWidth   = high_edge_width;            //highst value
    
    var dotArray ="";

    if (strength =="low"){
        color       = low_color;
        edgeWidth   = low_edge_width;
        dotArray    = "--";
    }
    else if (strength =="medium"){
        color       = medium_color;
        edgeWidth   = medium_edge_width;  
    }

    while(ry1<(maxInbetween+randExt)){
        check++;
        ry1=Math.sqrt(Math.pow((cy1-cy2),2))*check;        
    }
    

    paper.ellipse(
                        (cx1+rx1),
                            cy1 +40,
                            rx1,
                            ry1
                        ).attr({stroke: color, "stroke-width": edgeWidth, "stroke-dasharray":dotArray});
}








/*
    Draw half pie chart using center point and giving the percentages of inner volumes 
    and radious of the half circle.

    using inner method sector to draw sectors using the given percentages then adding 
    the animation to show given percentage of each sector with animation style.

*/
Raphael.fn.pieChart = function (cx, cy, r, values, labels, stroke) {
    var paper = this,
        rad = Math.PI / 180,
        chart = this.set();
    
    /*
        Draw a sector from center point with specific radious [r] to rotate clockwise from start angle [startAngle in Radian]
        to end angle [endAngle in radian] with ability to add styling/animation in the params array
    */
    function sector(cx, cy, r, startAngle, endAngle, params) {
        var x1 = cx + r * Math.cos(-startAngle * rad),
            x2 = cx + r * Math.cos(-endAngle * rad),
            y1 = cy + r * Math.sin(-startAngle * rad),
            y2 = cy + r * Math.sin(-endAngle * rad);
        return paper.path(["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
    }
    var angle = 0,
        total = 0,
        start = 0,
        process = function (j) {
            var value = values[j],
                angleplus = 180 * value / total,
                popangle = angle + (angleplus / 2),
                ms = 500,
                delta = 30,
                bcolor =labels[j],
                color=labels[j],
                p = sector(cx, cy, r, angle, angle + angleplus, {fill: "90-" + bcolor + "-" + color, stroke: stroke, "stroke-width":0.01});

               var txt;

                p.mouseover(function (e) {
                    p.stop().animate({transform: "s1.1 1.1 " + cx + " " + cy}, ms, "elastic");
                    txt = paper.text(cx, cy+10, values[j]+"%").attr({"font-size": 14,"font-weight":"bold"});
                    txt.stop().animate({opacity: 1}, ms, "elastic");

                }).mouseout(function () {
                    p.stop().animate({transform: ""}, ms, "elastic");
                    txt.stop().animate({opacity: 0}, ms);
                });

                angle += angleplus;
                chart.push(p);
                start += .1;
                };
    for (var i = 0, ii = values.length; i < ii; i++) {
        total += values[i];
    }
    for (i = 0; i < ii; i++) {
        process(i);
    }
    return chart;
};





/*
    Draw line method , to make it easier to call not to draw path and creat path 
    string each time
*/
function drawLine(startX, startY, endX, endY,params) {
    var start = {
        x: startX,
        y: startY
    };
    var end = {
        x: endX,
        y: endY
    };
    var getPath = function() {
        return "M" + start.x + " " + start.y + " L" + end.x + " " + end.y;
    };
    var redraw = function() {
        node.attr("path", getPath());
    }

    var node = paper.path(getPath()).attr(params);
    return {
        updateStart: function(x, y) {
            start.x = x;
            start.y = y;
            redraw();
            return this;
        },
        updateEnd: function(x, y) {
            end.x = x;
            end.y = y;
            redraw();
            return this;
        }
    };
};