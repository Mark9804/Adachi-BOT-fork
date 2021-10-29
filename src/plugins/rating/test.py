from paddleocr import PaddleOCR, draw_ocr
import sys
import logging

logger = logging.getLogger('paddle')
logger.setLevel(logging.WARN)

# Paddleocr目前支持的多语言语种可以通过修改lang参数进行切换
# 例如`ch`, `en`, `fr`, `german`, `korean`, `japan`
ocr = PaddleOCR(lang="ch", use_gpu=False,show_log=False, type="structure")  # need to run only once to download and load model into memory
img_path = sys.argv[1]

result = ocr.ocr(img_path, cls=True)

with open('image_info.txt','w') as f:
    for line in result:
        f.write(str(line) + '\n')
        print(line)

# for line in result:
#     print(line)

#  显示结果
# from PIL import Image

# image = Image.open(img_path).convert('RGB')
# boxes = [line[0] for line in result]
# txts = [line[1][0] for line in result]
# scores = [line[1][1] for line in result]
# im_show = draw_ocr(image, boxes, txts, scores, font_path='./fonts/simfang.ttf')
# im_show = Image.fromarray(im_show)
# im_show.save('result.jpg')
