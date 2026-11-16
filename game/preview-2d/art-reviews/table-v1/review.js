/* Review-only scene: no runtime game asset or approval record is changed. */
(() => {
 class TableReview extends Phaser.Scene {
  preload(){
   this.load.svg('backdrop','../../assets/scene/backdrop.svg',{width:1440,height:900});
   this.load.spritesheet('barista','../../assets/sprites/barista.png',{frameWidth:256,frameHeight:320,endFrame:15});
   this.load.spritesheet('waiter','../../assets/sprites/waiter.png',{frameWidth:256,frameHeight:320,endFrame:15});
   this.load.image('candidate','./table-candidate.webp');
   this.load.on('loaderror',()=>{document.getElementById('review-error').hidden=false});
  }
  create(){
   this.add.image(600,250,'backdrop').setDisplaySize(1200,750);
   this.add.ellipse(610,413,170,18,0x543e33,.13);
   this.add.sprite(250,420,'barista',0).setOrigin(.5,1).setDisplaySize(117,146);
   this.add.sprite(400,420,'barista',4).setOrigin(.5,1).setDisplaySize(117,146);
   this.add.sprite(550,420,'waiter',0).setOrigin(.5,1).setDisplaySize(117,146);
   this.add.image(800,420,'candidate').setOrigin(.5,1).setDisplaySize(140,86);
   this.add.text(250,450,'PNG gốc · pha chế và phục vụ',{fontSize:'17px',color:'#543e33'});
   this.add.text(710,450,'Codex tự đánh giá',{fontSize:'17px',color:'#543e33'});
   document.getElementById('review-scene').dataset.ready='true';
  }
 }
 try {
  new Phaser.Game({type:Phaser.AUTO,parent:'review-scene',width:1200,height:500,
   backgroundColor:'#f6efe3',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[TableReview]});
 }catch(error){document.getElementById('review-error').hidden=false;console.error(error)}
})();
