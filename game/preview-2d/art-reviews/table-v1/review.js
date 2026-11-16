/* Review-only scene: no runtime game asset or approval record is changed. */
(() => {
 class TableReview extends Phaser.Scene {
  preload(){
   this.load.svg('backdrop','../../assets/scene/backdrop.svg',{width:1440,height:900});
   this.load.spritesheet('barista','../../assets/sprites/barista.png',{frameWidth:256,frameHeight:320,endFrame:15});
   this.load.image('candidate','./table-candidate.webp');
   this.load.on('loaderror',()=>{document.getElementById('review-error').hidden=false});
  }
  create(){
   this.add.image(600,250,'backdrop').setDisplaySize(1200,750);
   this.add.ellipse(610,413,170,18,0x543e33,.13);
   this.add.sprite(300,420,'barista',0).setOrigin(.5,1).setDisplaySize(117,146);
   this.add.sprite(450,420,'barista',4).setOrigin(.5,1).setDisplaySize(117,146);
   this.add.image(650,420,'candidate').setOrigin(.5,1).setDisplaySize(140,86);
   this.add.text(250,450,'PNG gốc · hai hướng',{fontSize:'17px',color:'#543e33'});
   this.add.text(570,450,'Bàn mới · chưa duyệt',{fontSize:'17px',color:'#543e33'});
   document.getElementById('review-scene').dataset.ready='true';
  }
 }
 try {
  new Phaser.Game({type:Phaser.AUTO,parent:'review-scene',width:1200,height:500,
   backgroundColor:'#f6efe3',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[TableReview]});
 }catch(error){document.getElementById('review-error').hidden=false;console.error(error)}
})();
