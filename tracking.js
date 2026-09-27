/* CHIVA Vision 1.0 — optical image tracking in Safari.
   No image, pixel patch or camera frame is saved or transmitted.
   This is 2D appearance tracking, not persistent ARKit spatial anchoring. */
(function (root) {
  "use strict";
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function median(v) {
    var a=v.slice().sort(function(x,y){return x-y;});
    return a.length?a[Math.floor(a.length/2)]:0;
  }
  function frameToGray(rgba) {
    var p=rgba.data, g=new Uint8Array(rgba.width*rgba.height);
    for (var i=0,j=0;i<p.length;i+=4,j++)g[j]=(77*p[i]+150*p[i+1]+29*p[i+2])>>8;
    return {gray:g,width:rgba.width,height:rgba.height};
  }
  /* Normalized correlation makes moderate automatic-exposure changes tolerable. */
  function makePatch(frame,cx,cy,size) {
    var h=(size-1)/2,w=frame.width,hh=frame.height,g=frame.gray;
    if(cx-h<1||cy-h<1||cx+h>=w-1||cy+h>=hh-1)return null;
    var raw=[],sum=0,sq=0;
    for(var y=-h;y<=h;y+=2)for(var x=-h;x<=h;x+=2){
      var v=g[(cy+y)*w+cx+x];raw.push(v);sum+=v;sq+=v*v;
    }
    var m=sum/raw.length,variance=sq/raw.length-m*m;
    var centered=new Float32Array(raw.length),energy=0;
    for(var i=0;i<raw.length;i++){var d=raw[i]-m;centered[i]=d;energy+=d*d;}
    return {size:size,half:h,centered:centered,energy:energy,variance:variance};
  }
  function scoreAt(frame,patch,cx,cy) {
    var h=patch.half,w=frame.width,hh=frame.height,g=frame.gray;
    if(cx-h<1||cy-h<1||cx+h>=w-1||cy+h>=hh-1)return -2;
    var sum=0,sq=0,cross=0,n=0;
    for(var y=-h;y<=h;y+=2)for(var x=-h;x<=h;x+=2){
      var v=g[(cy+y)*w+cx+x];sum+=v;sq+=v*v;cross+=v*patch.centered[n++];
    }
    var variance=sq-sum*sum/n;
    return variance>100&&patch.energy>100?cross/Math.sqrt(variance*patch.energy):-2;
  }
  function bestMatch(frame,patch,aroundX,aroundY,radius) {
    var x0=clamp(Math.round(aroundX),0,frame.width-1),y0=clamp(Math.round(aroundY),0,frame.height-1);
    var best={score:-2,x:x0,y:y0}, near=Math.min(radius,14);
    for(var yy=y0-near;yy<=y0+near;yy++)for(var xx=x0-near;xx<=x0+near;xx++){
      var s=scoreAt(frame,patch,xx,yy);if(s>best.score)best={score:s,x:xx,y:yy};
    }
    if(best.score>0.77||radius<=near)return best;
    var leaders=[];
    for(var y=y0-radius;y<=y0+radius;y+=4)for(var x=x0-radius;x<=x0+radius;x+=4){
      var z=scoreAt(frame,patch,x,y);if(z>best.score)leaders.push({score:z,x:x,y:y});
    }
    leaders.sort(function(a,b){return b.score-a.score;});
    leaders=leaders.slice(0,12);
    for(var k=0;k<leaders.length;k++){
      var p=leaders[k];
      for(var cy=p.y-4;cy<=p.y+4;cy++)for(var cx=p.x-4;cx<=p.x+4;cx++){
        var m=scoreAt(frame,patch,cx,cy);if(m>best.score)best={score:m,x:cx,y:cy};
      }
    }
    if(radius>=45&&best.score<0.72){
      for(var sy=y0-radius;sy<=y0+radius;sy++)for(var sx=x0-radius;sx<=x0+radius;sx++){
        var q=scoreAt(frame,patch,sx,sy);if(q>best.score)best={score:q,x:sx,y:sy};
      }
    }
    return best;
  }
  function Tracker(opts) {
    this.video=opts.video;this.stage=opts.stage;
    this.onMove=opts.onMove||function(){};
    this.onStatus=opts.onStatus||function(){};
    this.anchors=new Map();
    this.canvas=document.createElement("canvas");
    this.ctx=this.canvas.getContext("2d",{willReadFrequently:true});
    this.active=false;this.handle=null;this.timer=null;this.last=0;this.frame=null;
  }
  Tracker.prototype.snapshot=function(){
    var video=this.video,stage=this.stage;
    if(!video||video.readyState<2||!video.videoWidth||!stage.clientWidth)return null;
    var w=248,h=Math.max(210,Math.min(530,Math.round(w*stage.clientHeight/stage.clientWidth)));
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
    var vw=video.videoWidth,vh=video.videoHeight,ar=w/h,vr=vw/vh;
    var sx=0,sy=0,sw=vw,sh=vh;
    if(vr>ar){sw=vh*ar;sx=(vw-sw)/2;}else{sh=vw/ar;sy=(vh-sh)/2;}
    try{this.ctx.drawImage(video,sx,sy,sw,sh,0,0,w,h);return frameToGray(this.ctx.getImageData(0,0,w,h));}
    catch(e){return null;}
  };
  Tracker.prototype.capture=function(id,xPct,yPct){
    var f=this.snapshot();if(!f)return {ok:false,reason:"La caméra doit être active."};
    var mx=Math.round(f.width*xPct/100),my=Math.round(f.height*yPct/100),best=null;
    var offsets=[0,-18,18,-34,34];
    for(var yi=0;yi<offsets.length;yi++)for(var xi=0;xi<offsets.length;xi++){
      var fx=mx+offsets[xi],fy=my+offsets[yi],p=makePatch(f,fx,fy,29);
      if(p&&(!best||p.variance>best.patch.variance))best={x:fx,y:fy,patch:p};
    }
    if(!best||best.patch.variance<65) {
      this.onStatus(id,"weak");
      return {ok:false,reason:"Pas assez de détails à cet endroit. Vise un bord de l'appareil et fixe de nouveau."};
    }
    this.anchors.set(id,{x:best.x,y:best.y,dx:best.x-mx,dy:best.y-my,patch:best.patch,screenX:xPct,screenY:yPct,misses:0,status:"locked",velocityX:0,velocityY:0,lastSearch:0});
    this.onStatus(id,"locked");this.onMove(id,xPct,yPct);
    return {ok:true,reason:"Repère verrouillé. Déplace doucement l'iPhone."};
  };
  Tracker.prototype.getPosition=function(id){var a=this.anchors.get(id);return a?{x:a.screenX,y:a.screenY,status:a.status}:null;};
  Tracker.prototype.release=function(id){if(id==null){this.anchors.clear();return;}this.anchors.delete(id);this.onStatus(id,"idle");};
  Tracker.prototype.step=function(frame,now){
    var self=this;
    this.anchors.forEach(function(a,id){
      var rx=clamp(Math.round(a.x+a.velocityX),0,frame.width-1),ry=clamp(Math.round(a.y+a.velocityY),0,frame.height-1);
      var radius=a.misses>2?Math.min(63,27+a.misses*6):26;
      if(a.misses>3 && now-a.lastSearch<420)return;
      a.lastSearch=now;
      var m=bestMatch(frame,a.patch,rx,ry,radius);
      var enough=m.score>(a.status==="lost"?0.78:0.72);
      if(!enough){
        a.misses++;a.velocityX=0;a.velocityY=0;
        if(a.misses>=4&&a.status!=="lost"){a.status="lost";self.onStatus(id,"lost");}
        return;
      }
      var dx=m.x-a.x,dy=m.y-a.y;
      if(Math.hypot(dx,dy)>65)return;
      a.velocityX=median([dx,a.velocityX*0.55,dx*0.7]);a.velocityY=median([dy,a.velocityY*0.55,dy*0.7]);
      a.x=m.x;a.y=m.y;a.misses=0;
      a.screenX=clamp(100*(a.x-a.dx)/frame.width,0,100);
      a.screenY=clamp(100*(a.y-a.dy)/frame.height,0,100);
      if(a.status!=="locked"){a.status="locked";self.onStatus(id,"locked");}
      self.onMove(id,a.screenX,a.screenY);
    });
  };
  Tracker.prototype.tick=function(timestamp){
    if(!this.active)return;
    if(timestamp-this.last<135)return;
    this.last=timestamp;var f=this.snapshot();if(f)this.step(f,timestamp);
  };
  Tracker.prototype.start=function(){
    var self=this;if(this.active)return;
    this.active=true;this.last=0;
    if(typeof this.video.requestVideoFrameCallback==="function"){
      var loop=function(now){if(!self.active)return;self.tick(now);if(self.active)self.handle=self.video.requestVideoFrameCallback(loop);};
      self.handle=this.video.requestVideoFrameCallback(loop);
    }else this.timer=setInterval(function(){self.tick(performance.now());},160);
  };
  Tracker.prototype.stop=function(){
    this.active=false;if(this.timer){clearInterval(this.timer);this.timer=null;}
    if(this.handle!==null&&typeof this.video.cancelVideoFrameCallback==="function")try{this.video.cancelVideoFrameCallback(this.handle)}catch(e){}
    this.handle=null;this.release();
  };
  root.CHIVATracker=Tracker;
  root.CHIVATrackerTest={frameToGray:frameToGray,makePatch:makePatch,bestMatch:bestMatch,scoreAt:scoreAt};
})(window);
