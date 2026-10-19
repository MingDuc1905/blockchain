import docx
import re
import sys
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

sys.stdout.reconfigure(encoding='utf-8')

docx_path = r'd:\block chain\docs\báo cáo đồ án 4.docx'
doc = docx.Document(docx_path)

# 1. Update font and styles to Times New Roman across all styles
for s in doc.styles:
    if s.type == docx.enum.style.WD_STYLE_TYPE.PARAGRAPH:
        s.font.name = 'Times New Roman'
        # ensure rFonts in style element
        rPr = s._element.get_or_add_rPr()
        rFonts = rPr.find(qn('w:rFonts'))
        if rFonts is None:
            rFonts = OxmlElement('w:rFonts')
            rPr.append(rFonts)
        rFonts.set(qn('w:ascii'), 'Times New Roman')
        rFonts.set(qn('w:hAnsi'), 'Times New Roman')
        rFonts.set(qn('w:cs'), 'Times New Roman')

# 2. Fix abstractNumId 7 (Heading numbering):
# lvl 0: suff='space', left='0', hanging='0'
num_xml = doc.part.numbering_part._element
namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
for absNum in num_xml.findall('w:abstractNum', namespaces):
    if absNum.attrib.get(qn('w:abstractNumId')) == '7':
        for lvl in absNum.findall('w:lvl', namespaces):
            if lvl.attrib.get(qn('w:ilvl')) == '0':
                suff = lvl.find('w:suff', namespaces)
                if suff is None:
                    suff = OxmlElement('w:suff')
                    lvl.insert(0, suff)
                suff.set(qn('w:val'), 'space')
                pPr = lvl.find('w:pPr', namespaces)
                if pPr is not None:
                    ind = pPr.find('w:ind', namespaces)
                    if ind is not None:
                        ind.set(qn('w:left'), '0')
                        ind.set(qn('w:hanging'), '0')
                print('Fixed numbering lvl 0: space and zero indent!')

# 3. Ensure all Heading 1 paragraphs are center-aligned with no left/firstLine indent
for p in doc.paragraphs:
    if p.style.name == 'Heading 1':
        pPr = p._element.get_or_add_pPr()
        for child in list(pPr):
            if child.tag.endswith('jc'):
                pPr.remove(child)
            elif child.tag.endswith('ind'):
                pPr.remove(child)
        jc = OxmlElement('w:jc')
        jc.set(qn('w:val'), 'center')
        pPr.append(jc)
        ind = OxmlElement('w:ind')
        ind.set(qn('w:left'), '0')
        ind.set(qn('w:firstLine'), '0')
        pPr.append(ind)
print('Centered all Heading 1 paragraphs!')

# 4. Map TOC page numbers accurately
page_map = {
    'DANH MỤC BẢNG': 'iii',
    'DANH MỤC HÌNH': 'iv',
    'CHƯƠNG 1': '1',
    '1.1.': '1',
    '1.1.1.': '1',
    '1.1.2.': '1',
    '1.2.': '1',
    '1.2.1.': '1',
    '1.2.2.': '2',
    '1.3.': '2',
    '1.3.1.': '2',
    '1.3.2.': '2',
    '1.4.': '3',
    '1.5.': '3',
    'CHƯƠNG 2': '4',
    '2.1.': '4',
    '2.2.': '4',
    '2.3.': '5',
    'CHƯƠNG 3': '6',
    '3.1.': '6',
    '3.2.': '6',
    '3.3.': '7',
    'CHƯƠNG 4': '8',
    '4.1.': '8',
    '4.2.': '8',
    '4.3.': '9',
    '4.4.': '9',
    '4.5.': '10',
    '4.5.1.': '10',
    '4.5.2.': '10',
    '4.5.3.': '11',
    'CHƯƠNG 5': '12',
    '5.1.': '12',
    '5.2.': '12',
    'TÀI LIỆU THAM KHẢO': '13'
}

for i in range(31, 66):
    p = doc.paragraphs[i]
    runs = p._element.xpath('.//w:hyperlink//w:r[w:t]')
    if runs:
        last_r = runs[-1]
        t_elem = last_r.find(qn('w:t'))
        first_r = runs[0]
        first_t = first_r.find(qn('w:t')).text if first_r.find(qn('w:t')) is not None else ''
        for prefix, new_page in page_map.items():
            if first_t.startswith(prefix):
                if t_elem is not None:
                    t_elem.text = new_page
                    print(f'Updated TOC "{first_t[:25]}" -> {new_page}')
                break

# 5. Format List of Tables and Figures with TOC tab stops and dot leaders (pos=9448)
for i in [69, 70, 73, 74, 75, 76]:
    p = doc.paragraphs[i]
    pPr = p._element.get_or_add_pPr()
    for child in list(pPr):
        if child.tag.endswith('tabs'):
            pPr.remove(child)
        elif child.tag.endswith('ind'):
            pPr.remove(child)
    tabs = OxmlElement('w:tabs')
    tab = OxmlElement('w:tab')
    tab.set(qn('w:val'), 'right')
    tab.set(qn('w:leader'), 'dot')
    tab.set(qn('w:pos'), '9448')
    tabs.append(tab)
    pPr.append(tabs)
    ind = OxmlElement('w:ind')
    ind.set(qn('w:left'), '0')
    ind.set(qn('w:firstLine'), '0')
    pPr.append(ind)
print('Formatted List of Tables and Figures with dot leaders!')

# 6. Ensure all runs across entire document use Times New Roman
for p in doc.paragraphs:
    for r in p.runs:
        if r.font.name != 'Courier New': # keep code block font
            r.font.name = 'Times New Roman'
for t in doc.tables:
    for row in t.rows:
        for c in row.cells:
            for p in c.paragraphs:
                for r in p.runs:
                    r.font.name = 'Times New Roman'
print('Verified Times New Roman on all runs and table cells!')

doc.save(docx_path)
doc.save(r'd:\block chain\docs\Bao_Cao_Do_An_De_Tai_04_Chuan_Format.docx')
print('Successfully saved Word document!')

