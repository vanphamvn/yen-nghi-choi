"""Crop and downsample generated art; preserve alpha and aspect. Never repaint."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import sys,json
root=Path(__file__).resolve().parents[1];out=root/'art-reviews/counter-v1';out.mkdir(parents=True,exist_ok=True)
meta={}
for name,source_file,max_edge in [('counter',sys.argv[1],768),('machine',sys.argv[2],256)]:
 src=Image.open(source_file).convert('RGBA');a=src.getchannel('A')
 box=a.point(lambda v:255 if v>=4 else 0).getbbox()
 if not box or a.getextrema()[0]!=0:raise ValueError('Actual alpha required')
 l,t,r,b=box;im=src.crop((max(0,l-4),max(0,t-4),min(src.width,r+4),min(src.height,b+4)))
 im.thumbnail((max_edge,max_edge),Image.Resampling.LANCZOS);im.save(root/f'assets/scene/{name}-painted-v1.webp',lossless=True)
 meta[name]={'source':Path(source_file).name,'sourceSize':src.size,'bounds':box,'normalizedSize':im.size}
meta['counter']['frontStart']=round(meta['counter']['normalizedSize'][1]*.21)
meta['counter']['runtimeSize']=[360,round(360*meta['counter']['normalizedSize'][1]/meta['counter']['normalizedSize'][0])]
meta['machine']['runtimeSize']=[85,round(85*meta['machine']['normalizedSize'][1]/meta['machine']['normalizedSize'][0])]
(out/'sources.json').write_text(json.dumps(meta,indent=2)+'\n')
board=Image.new('RGB',(1200,850),'#f6efe3');d=ImageDraw.Draw(board)
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';big=ImageFont.truetype(font,25);small=ImageFont.truetype(font,17)
d.text((28,22),'YÊN | QUẦY VÀ MÁY PHA — CODEX ĐỐI CHIẾU',font=big,fill='#543e33')
d.text((28,66),'PNG gốc: pha chế trước/nghiêng và phục vụ 117 × 146 px.',font=small,fill='#543e33')
d.text((28,98),f"Quầy {meta['counter']['runtimeSize']} · Máy {meta['machine']['runtimeSize']} · Chủ quán kiểm tra sau.",font=small,fill='#543e33')
for y in range(144,370,12):
 for x in range(28,1170,12):d.rectangle((x,y,x+11,y+11),fill='#ede6da' if ((x-28)//12+(y-144)//12)%2 else '#fffaf1')
refs=[]
for role,row,x in [('barista',0,40),('barista',1,180),('waiter',0,320)]:
 im=Image.open(root/f'assets/sprites/{role}.png').convert('RGBA').crop((0,row*320,256,(row+1)*320)).resize((117,146),Image.Resampling.LANCZOS);refs.append(im);board.paste(im,(x,345-146),im)
counter=Image.open(root/'assets/scene/counter-painted-v1.webp').resize(tuple(meta['counter']['runtimeSize']),Image.Resampling.LANCZOS)
machine=Image.open(root/'assets/scene/machine-painted-v1.webp').resize(tuple(meta['machine']['runtimeSize']),Image.Resampling.LANCZOS)
board.paste(counter,(500,345-counter.height),counter);board.paste(machine,(930,345-machine.height),machine)
d.text((28,400),'Kiểm tra chia lớp ở cùng tỉ lệ: mặt sau → nhân vật → máy → mặt trước',font=small,fill='#543e33')
scene=Image.new('RGBA',(700,220),(0,0,0,0));cx,cy=280,200
cut=round(counter.height*.21)
# Slice one original image, avoiding repainting or a misaligned front/back pair.
scene.alpha_composite(counter.crop((0,0,counter.width,cut)),(cx,cy-counter.height))
scene.alpha_composite(refs[0],(cx-3,cy-40-146))
scene.alpha_composite(machine,(cx+178,cy-counter.height+15-machine.height))
scene.alpha_composite(counter.crop((0,cut,counter.width,counter.height)),(cx,cy-counter.height+cut))
zoom=scene.resize((1050,330),Image.Resampling.NEAREST);board.paste(zoom,(28,450),zoom)
d.text((28,805),'Ảnh này chứng minh tỉ lệ/lớp art; ảnh Phaser thực tế và kết quả CI được lưu riêng.',font=small,fill='#543e33')
board.save(out/'contact-sheet.png',optimize=True);print(json.dumps(meta))
