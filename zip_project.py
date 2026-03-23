import os
import zipfile

def create_submission_zip(zip_filename="project_submission.zip"):
    # Things we DO NOT want in the zip file
    exclude_dirs = {'node_modules', '.git', 'dist'}
    exclude_files = {'.env', '.env.swp', zip_filename, 'zip_project.py'}

    print("Creating zip file...")
    
    # Open a new zip file in write mode
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Tell os.walk to skip our excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            for file in files:
                if file not in exclude_files and not file.endswith('.zip'):
                    file_path = os.path.join(root, file)
                    # The archive name should be the relative path
                    archive_name = os.path.relpath(file_path, '.')
                    zipf.write(file_path, archive_name)
                    
    print(f"✅ Successfully created '{zip_filename}'!")
    print("🔒 Protected: 'node_modules/' and '.env' were safely excluded.")

if __name__ == "__main__":
    create_submission_zip()
    