import PyPDF2
import sys
sys.stdout.reconfigure(encoding='utf-8')
path = r'c:\Users\DELL\OneDrive\Desktop\VCC project code.pdf'
reader = PyPDF2.PdfReader(path)
for i,page in enumerate(reader.pages):
    text = page.extract_text()
    print(f'---PAGE {i+1}---')
    print(text)
