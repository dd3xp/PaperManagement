import os

def replace_text_in_file(file_path, text_to_replace, replacement_text):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            file_contents = file.read()
        file_contents = file_contents.replace(text_to_replace, replacement_text)
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(file_contents)
    except Exception as e:
        print(f"Error processing file {file_path}: {e}")

def replace_text_in_directory(directory, text_to_replace, replacement_text):
    for root, dirs, files in os.walk(directory):
        # 跳过任何名为node_modules的文件夹
        dirs[:] = [d for d in dirs if d != 'node_modules']
        for file in files:
            file_path = os.path.join(root, file)
            replace_text_in_file(file_path, text_to_replace, replacement_text)

def main():
    directory = '.'  # 根目录
    replacements = {
        'localhost:3000' : 'localhost:3000', #前端
        'localhost:5001': 'localhost:5001'   #后端
    } # ======================================在此处修改=======================================
    
    for text_to_replace, replacement_text in replacements.items():
        replace_text_in_directory(directory, text_to_replace, replacement_text)
    print("替换完成。")

if __name__ == "__main__":
    main()
