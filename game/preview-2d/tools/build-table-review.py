"""Compose a review board from original role frames and an imagegen candidate."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import sys

root = Path(__file__).resolve().parents[1]
out = root / 'art-reviews/table-v1'
out.mkdir(parents=True, exist_ok=True)
source = Image.open(sys.argv[1]).convert('RGBA')
alpha = source.getchannel('A')
bounds = alpha.point(lambda value: 255 if value >= 4 else 0).getbbox()
if bounds is None:
    raise ValueError('Candidate has no visible content')
l, t, r, b = bounds
crop = source.crop((max(0,l-8),max(0,t-8),min(source.width,r+8),min(source.height,b+8)))
crop.save(out / 'table-candidate.webp', lossless=True)
ref = Image.open(root / 'assets/sprites/barista.png').convert('RGBA')
front = ref.crop((0,0,256,320)).resize((117,146),Image.Resampling.LANCZOS)
side = ref.crop((0,320,256,640)).resize((117,146),Image.Resampling.LANCZOS)
table = crop.resize((140,86),Image.Resampling.LANCZOS)
waiter_source = Image.open(root / 'assets/sprites/waiter.png').convert('RGBA')
waiter = waiter_source.crop((0,0,256,320)).resize((117,146),Image.Resampling.LANCZOS)
board = Image.new('RGB',(1200,760),'#f6efe3')
d = ImageDraw.Draw(board)
font = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(font,25), ImageFont.truetype(font,16)
d.text((32,24),'YÊN | MẪU BÀN V1 — CODEX TỰ ĐÁNH GIÁ',font=big,fill='#543e33')
d.text((32,66),'PNG gốc: pha chế trước/nghiêng và phục vụ. Codex tự đánh giá; chủ quán kiểm tra sau.',font=small,fill='#543e33')
d.text((32,106),'Kích thước thử: nhân vật 117 × 146 px; bàn 140 × 86 px.',font=small,fill='#543e33')
for y in range(150,350,12):
    for x in range(32,680,12):
        d.rectangle((x,y,x+11,y+11),fill='#ede6da' if ((x-32)//12+(y-150)//12)%2 else '#fffaf1')
for image, x in [(front,40),(side,180),(waiter,320),(table,500)]:
    board.paste(image,(x,330-image.height),image)
d.line((32,330,680,330),fill='#b49475',width=1)
d.text((720,170),'Codex đã đối chiếu:',font=big,fill='#543e33')
for i,line in enumerate(['Nét viền và chất liệu so với nhân vật','Ánh sáng, màu gỗ và phối cảnh','Tỉ lệ khi đứng cạnh người','Đường alpha và điểm chân bàn','Chủ quán kiểm tra sau','Đã đối chiếu bằng Phaser']):
    d.text((720,215+i*29),line,font=small,fill='#543e33')
d.text((32,383),'Phóng lớn 1,8× cùng bố cục để xem chi tiết',font=small,fill='#543e33')
strip = Image.new('RGBA',(650,160),(0,0,0,0))
for image, x in [(front,8),(side,148),(waiter,288),(table,468)]:
    strip.alpha_composite(image,(x,150-image.height))
strip = strip.resize((1058,288),Image.Resampling.NEAREST)
board.paste(strip,(32,420),strip)
board.save(out / 'contact-sheet.png',optimize=True)
print('Review assets built:',out)
