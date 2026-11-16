"""Normalize imagegen RGBA detail crops and build an actual runtime-scale board.
Usage: python3 tools/build-detail-review.py cup.png book.png cushion.png
Original generated sources are preserved; no repainting or alpha replacement.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import sys, json
root=Path(__file__).resolve().parents[1]
out=root/'art-reviews/details-v1';out.mkdir(parents=True,exist_ok=True)
meta={}
for name,file in zip(['cup','book','cushion'],sys.argv[1:]):
    source=Image.open(file).convert('RGBA')
    alpha=source.getchannel('A'); bounds=alpha.point(lambda v:255 if v>=4 else 0).getbbox()
    if not bounds or alpha.getextrema()[0]!=0: raise ValueError('Real transparent asset required')
    l,t,r,b=bounds
    crop=source.crop((max(0,l-4),max(0,t-4),min(source.width,r+4),min(source.height,b+4)))
    crop.thumbnail((384,384),Image.Resampling.LANCZOS)
    target=root/f'assets/scene/{name}-painted-v1.webp';crop.save(target,lossless=True)
    meta[name]={'generatedSource':Path(file).name,'sourceSize':source.size,'cropBounds':bounds,'normalizedSize':crop.size,'runtimeSize':{'cup':[24,24],'book':[35,17],'cushion':[69,47]}[name]}
(out/'sources.json').write_text(json.dumps(meta,indent=2)+'\n')
board=Image.new('RGB',(1200,800),'#f6efe3');d=ImageDraw.Draw(board)
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';big=ImageFont.truetype(font,25);small=ImageFont.truetype(font,17)
d.text((28,22),'YÊN | LY · SÁCH · GỐI — ĐỐI CHIẾU ART V1',font=big,fill='#543e33')
d.text((28,66),'PNG gốc: pha chế trước/nghiêng và phục vụ; nhân vật 117 × 146 px.',font=small,fill='#543e33')
d.text((28,98),'Ly 24 × 24 · Sách 35 × 17 · Gối 69 × 47. Codex tự đánh giá; chủ quán kiểm tra sau.',font=small,fill='#543e33')
for y in range(144,350,12):
 for x in range(28,1170,12):
  d.rectangle((x,y,x+11,y+11),fill='#ede6da' if ((x-28)//12+(y-144)//12)%2 else '#fffaf1')
strip=Image.new('RGBA',(1100,170),(0,0,0,0))
for role,row,x in [('barista',0,5),('barista',1,145),('waiter',0,285)]:
 im=Image.open(root/f'assets/sprites/{role}.png').convert('RGBA').crop((0,row*320,256,(row+1)*320)).resize((117,146),Image.Resampling.LANCZOS)
 strip.alpha_composite(im,(x,165-146))
table=Image.open(root/'assets/scene/table-painted-v1.webp').resize((140,86),Image.Resampling.LANCZOS);strip.alpha_composite(table,(440,79))
for name,xy in [('cup',(518,79)),('book',(474,87)),('cushion',(660,165-47))]:
 im=Image.open(root/f'assets/scene/{name}-painted-v1.webp').resize(tuple(meta[name]['runtimeSize']),Image.Resampling.LANCZOS)
 strip.alpha_composite(im,xy)
board.paste(strip,(38,165),strip)
d.text((800,200),'Nét mảnh nâu ấm; sáng trái trên.',font=small,fill='#543e33')
d.text((800,232),'Vật liệu gốm / giấy / vải.',font=small,fill='#543e33')
d.text((800,264),'Alpha thật, layer độc lập.',font=small,fill='#543e33')
d.text((28,383),'Phóng lớn 1,5× cùng tỉ lệ để kiểm tra chi tiết',font=small,fill='#543e33')
zoom=strip.crop((0,0,745,170)).resize((1118,255),Image.Resampling.NEAREST);board.paste(zoom,(28,425),zoom)
d.text((28,728),'Không phải duyệt của chủ quán. Cần kiểm tra thêm cảnh Phaser và ảnh viewport trong CI.',font=small,fill='#543e33')
board.save(out/'contact-sheet.png',optimize=True)
print(json.dumps(meta))
