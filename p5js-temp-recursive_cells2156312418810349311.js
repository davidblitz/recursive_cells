//inspired by: https://generativelandscapes.wordpress.com/2014/08/28/ice-ray-lattice-basic-recursion-example-8-1/

var cell;
var palette;

function splitOnMiddle(currentCell, nextLevel) {
  let splitPoint1 = currentCell.splitSideMiddle(currentCell.splitPoint);
  let splitPoint2 = currentCell.splitSideMiddle(currentCell.splitPoint2);
  let children = currentCell.split(splitPoint1, splitPoint2);
  nextLevel.push(children[0]);
  nextLevel.push(children[1]);
}

function splitAlongCentroidLine(currentCell, nextLevel) {
  let centroidLine = currentCell.getCentroidLine();
  let splitPoints = currentCell.findLineSplitPoints(centroidLine);
  print(splitPoints);
  let children = currentCell.split(splitPoints[0], splitPoints[1]);
  
  nextLevel.push(children[0]);
  nextLevel.push(children[1]);
}

function setup() {
  //palette  = [color("#FF530D"), color("#E82C0C"), color("#E80C7A"), color("#FF0DFF")]; //very red
  palette = [color(1,31,75,150), color(3,57,108,150), color(0,91,150,150), color(100,151,177,150), color(179,205,224)]; //beautiful blue
  //palette = [color(160,214,180,150), color(95,158,160,150), color(163,193,173,150), color(73,121,107, 150), color(49,120,115)] //seafoam
  
  createCanvas(1000, 800);
  background(palette[0]);
  stroke(palette[0]);
  
  var vert = [];
  /**
  for(var i = 0; i < 3; i++){
    vert.push(createVector(random(width), random(height)));
  }
  **/
   verts = [createVector(0, height),
    createVector(width, height),
    createVector(width, 0),
    createVector(0, 0)];
    
   cell = new Cell(verts);
   currentLevel = [cell];
   
//   ellipse(cell.firstMiddlePoint.x, cell.firstMiddlePoint.y, 20, 20);
//   ellipse(cell.secondMiddlePoint.x, cell.secondMiddlePoint.y, 20, 20);
   let max_depth = 10;
   for(let i=0; i<max_depth; i++) {
     nextLevel = [];
     currentLevel.forEach(currentCell => {
       if(currentCell.area > width*height / 200) {
         splitAlongCentroidLine(currentCell, nextLevel);
       } else {
         nextLevel.push(currentCell);
       }
     });
     currentLevel = nextLevel;
   }
   
   strokeWeight(5);
   currentLevel.forEach(currentCell => {
     let col = floor(random(palette.length));
     
     fill(palette[col]);
     currentCell.draw()
   });
  
}

function draw() {
    //background(0,0,255);
    
   //cell.draw() 


}

function Cell(verts) {
    this.findCentroid  = function(verts) {
      let N = verts.length;
      
      xCentroid = 0.0;
      yCentroid = 0.0;
    
      verts.forEach(point => {
        xCentroid += point.x / N;
        yCentroid += point.y / N;
      });
    
      return createVector(xCentroid, yCentroid);
    };
    
    this.orderVertices = function(verts) {
      let centroid = this.findCentroid(verts);
      
      let angledVertices = [];
      verts.forEach(point => {
        let angle = atan2(point.y - centroid.y, point.x - centroid.x);
        angledVertices.push([point, angle]);
        //console.log(angle);
      });
      
      angledVertices.sort(function(a, b) {
        if(a[1] < b[1]) {
          return -1;
        } else {
          return 1;
        }
      });
      
      let ret = [];
      angledVertices.forEach(pair => {
        ret.push(pair[0]);
      });
      
      return ret;
    };
    
  this.findArea = function(verts) {
    let area = 0.0;
    let N = verts.length;
    
    for(let i=0; i<verts.length; i++) {
      area += 0.5*(verts[i].x*verts[(i+1)%N].y - verts[i].y * verts[(i+1)%N].x);
    }
    
    return area;
  };
  
  this.getCentroidLine = function() {
    let centroid = this.findCentroid(this.vertices);
    print(centroid)
    let angle = random(PI);
    
    let direction = createVector(cos(angle), sin(angle));
    let normal = createVector(-direction.y, direction.x);
    
    let intercept = p5.Vector.dot(normal, centroid);
    
    return {'normal': normal, 'intercept': intercept};
  };
  
  this.findLineSplitPoints = function(centroidLine){
    N = this.vertices.length;
    let splitPoints = [];
    
    for(let i=0; i<N; i++) {
      vert1 = this.vertices[i];
      vert2 = this.vertices[(i+1) % N];
      
      
      let directionSide = createVector(vert1.x - vert2.x, vert1.y - vert2.y);
      /*
      let directionDiff = p5.Vector.sub(directionSide, centroidLine[1]);
      let baseDiff = p5.Vector.sub(vert2, centroidLine[0]);
      
      if(directionDiff.x != 0) {
        lambda = -directionDiff.x / baseDiff.x;   
      } else if (directionDiff.y != 0) {
        lambda = -directionDiff.y / baseDiff.y;
      } else {
        continue;
      }
      print(lambda);
      let intersectionPoint = p5.Vector.add(vert2, p5.Vector.mult(directionSide, lambda)); 
      */
      
      let sideNormal = createVector(-directionSide.y, directionSide.x).normalize();
      let sideIntercept = p5.Vector.dot(sideNormal, vert2);
      
      //float delta = A1 * B2 - A2 * B1;
      let delta = sideNormal.x*centroidLine.normal.y - sideNormal.y*centroidLine.normal.x;
      
      if(delta == 0) {
        continue;
      }
      
      /*
      float x = (B2 * C1 - B1 * C2) / delta;
      float y = (A1 * C2 - A2 * C1) / delta;
      */
      let ix = (centroidLine.normal.y * sideIntercept - sideNormal.y * centroidLine.intercept) / delta;
      let iy = (sideNormal.x * centroidLine.intercept - centroidLine.normal.x * sideIntercept) / delta;
      
      let intersectionPoint = createVector(ix, iy);
      print(intersectionPoint);
      let d1 = p5.Vector.dist(intersectionPoint, vert1);
      let d2 = p5.Vector.dist(intersectionPoint, vert2);
      let d3 = p5.Vector.dist(vert1, vert2);
      
      if( abs(d1 + d2 - d3) < 1) {
        splitPoints.push(intersectionPoint);
      }
      
    } 
    
    return splitPoints;
  };
  
  this.vertices = this.orderVertices(verts);
  this.area = this.findArea(this.vertices);
  
  this.splitPoint = floor(random(this.vertices.length));
  this.splitPoint2 = ((this.splitPoint + floor(random(this.vertices.length-1))+1) % this.vertices.length);
  
  this.splitSideMiddle = function(splitPoint) {
    var splitVert = this.vertices[splitPoint];
    var followingSplitVert = this.vertices[(splitPoint + 1) % this.vertices.length];
    var middlePointSum = p5.Vector.add(splitVert,followingSplitVert);
    return p5.Vector.div(middlePointSum, 2);
  }
  
  this.splitSideRandom = function(splitPoint) {
    let splitVert = this.vertices[splitPoint];
    let followingSplitVert = this.vertices[(splitPoint + 1) % this.vertices.length];
    let r = random(1);
    return createVector( r*splitVert.x + (1-r)*followingSplitVert.x, r*splitVert.y + (1-r)*followingSplitVert.y); 
  }
  
  this.firstMiddlePoint = this.splitSideMiddle(this.splitPoint);
  this.secondMiddlePoint = this.splitSideMiddle(this.splitPoint2);
  
  this.split = function(point1, point2) {
    var diffVector = createVector(point1.x - point2.x, point1.y - point2.y);
    var normalVector = createVector(-diffVector.y, diffVector.x);
    
    var intercept = p5.Vector.dot(point1, normalVector);
    
    let childCellVerts1 = [point1, point2];
    let childCellVerts2 = [point1, point2];
    
    this.vertices.forEach(point => {
      if(p5.Vector.dot(point, normalVector) >= intercept) {
        childCellVerts1.push(point);
      }
      if(p5.Vector.dot(point, normalVector) <= intercept) {
        childCellVerts2.push(point);
      }
    });
    
    
    return [new Cell(childCellVerts1), new Cell(childCellVerts2)];
  };
  

  
  this.draw = function() {
   beginShape();
   this.vertices.forEach(point => {
     vertex(point.x, point.y);
   });
   endShape(CLOSE);
  }
}
