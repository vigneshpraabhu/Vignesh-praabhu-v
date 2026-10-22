import re

def convert_md_to_html(md_path, html_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    html_template = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ResQLink Project Report</title>
<style>
  @page {
    size: A4;
    margin: 25mm 20mm 25mm 30mm;
  }
  @media print {
    body {
      background: white;
      color: black;
    }
    .page-break {
      page-break-after: always;
    }
  }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #111;
    max-width: 800px;
    margin: 40px auto;
    padding: 20px 40px;
    background: #fff;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
  }
  h1.main-title {
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    margin-top: 24pt;
    margin-bottom: 12pt;
    text-transform: uppercase;
  }
  h2.main-heading {
    font-size: 14pt;
    font-weight: bold;
    text-align: left;
    margin-top: 18pt;
    margin-bottom: 6pt;
  }
  h3.sub-heading {
    font-size: 12pt;
    font-weight: bold;
    text-align: left;
    margin-top: 14pt;
    margin-bottom: 4pt;
  }
  p {
    text-align: justify;
    line-height: 1.5;
    margin-bottom: 8pt;
  }
  ul, ol {
    margin-top: 4pt;
    margin-bottom: 8pt;
    padding-left: 24pt;
    line-height: 1.5;
    text-align: justify;
  }
  li {
    margin-bottom: 4pt;
  }
  pre, code {
    font-family: Consolas, "Courier New", monospace;
  }
  pre {
    font-size: 10pt;
    line-height: 1.2;
    text-align: left;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 10px 14px;
    margin-left: 18pt;
    margin-bottom: 10pt;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12pt 0;
    line-height: 1.5;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 8pt 10pt;
    text-align: left;
    font-size: 11pt;
  }
  th {
    background-color: #f1f5f9;
    font-weight: bold;
  }
  .center {
    text-align: center;
  }
  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 24pt 0;
  }
  .page-break {
    page-break-after: always;
    height: 1px;
  }
</style>
</head>
<body>
"""

    lines = content.split('\n')
    in_code = False
    code_buf = []
    html_lines = []

    for line in lines:
        if line.startswith('```'):
            if in_code:
                in_code = False
                html_lines.append('<pre><code>' + '\n'.join(code_buf) + '</code></pre>')
                code_buf = []
            else:
                in_code = True
            continue

        if in_code:
            code_buf.append(line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))
            continue

        if line.startswith('# '):
            html_lines.append(f'<h1 class="main-title">{line[2:].strip()}</h1>')
        elif line.startswith('## '):
            html_lines.append(f'<h2 class="main-heading">{line[3:].strip()}</h2>')
        elif line.startswith('### ') or line.startswith('#### '):
            level = line.find(' ')
            html_lines.append(f'<h3 class="sub-heading">{line[level+1:].strip()}</h3>')
        elif line.startswith('---'):
            html_lines.append('<div class="page-break"></div><hr>')
        elif line.startswith('* ') or line.startswith('- '):
            html_lines.append(f'<ul><li>{line[2:].strip()}</li></ul>')
        elif re.match(r'^\d+\.\s', line):
            html_lines.append(f'<ol><li>{line[line.find(" ")+1:].strip()}</li></ol>')
        elif line.startswith('|'):
            # simple table row
            cells = [c.strip() for c in line.split('|')[1:-1]]
            if not any(cells) or '---' in cells[0]:
                continue
            row_html = ''.join(f'<td>{c}</td>' for c in cells)
            html_lines.append(f'<table><tr>{row_html}</tr></table>')
        elif line.strip():
            # replace **bold** and *italic*
            txt = line
            txt = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', txt)
            txt = re.sub(r'\*(.*?)\*', r'<em>\1</em>', txt)
            txt = re.sub(r'`(.*?)`', r'<code>\1</code>', txt)
            html_lines.append(f'<p>{txt}</p>')

    html_template += '\n'.join(html_lines)
    html_template += "\n</body></html>"

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_template)
    print("HTML report successfully generated at:", html_path)

if __name__ == '__main__':
    convert_md_to_html(
        r"C:\Users\praab\.gemini\antigravity\brain\6160f0d3-ceeb-4ca0-a691-37e4ec3ea739\ResQLink_Project_Report.md",
        r"c:\Users\praab\Downloads\fsdp\ResQLink_Project_Report.html"
    )
