from bs4 import BeautifulSoup

# Список файлов для обработки
files = ['messages2.html', 'messages3.html']

for file in files:
    # Загрузите ваш HTML-файл
    with open(file, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Создайте объект Beautiful Soup
    soup = BeautifulSoup(html_content, 'html.parser')

    # Извлеките весь текст без HTML-тегов
    text = soup.get_text()

    # Удалите все ненужные символы новой строки
    text = text.replace('\n', ' ')

    # Сохраните текст в txt-файл
    output_file = file.replace('.html', '.txt')
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(text)
