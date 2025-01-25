from bs4 import BeautifulSoup
file_path = "C:/doc.html"
with open(file_path, 'r') as file:
    soup = BeautifulSoup(file, 'html.parser')

# Encontrar todos los enlaces que apunten a imágenes
images = soup.find_all('img')

for image in images:
    src = image.get('src')
    print(src)