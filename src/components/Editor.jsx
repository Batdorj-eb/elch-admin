// components/Editor.jsx
// CKEditor 5 - NPM Package Version

import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function Editor({ value, onChange, uploadImage, uploadVideo }) {
  
  // 🔥 Custom Upload Adapter
  class MyUploadAdapter {
    constructor(loader) {
      this.loader = loader;
    }

    upload() {
      return this.loader.file.then(file => {
        return new Promise(async (resolve, reject) => {
          try {
            console.log('📤 Uploading:', file.name);
            
            const isVideo = file.type.startsWith('video/');
            let url;
            
            if (isVideo && uploadVideo) {
              url = await uploadVideo(file);
            } else if (uploadImage) {
              url = await uploadImage(file);
            } else {
              throw new Error('Upload function not available');
            }

            console.log('✅ Uploaded:', url);

            resolve({
              default: url
            });
          } catch (error) {
            console.error('❌ Upload failed:', error);
            alert('Upload алдаа: ' + error.message);
            reject(error);
          }
        });
      });
    }

    abort() {
      console.log('Upload aborted');
    }
  }

  function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader);
    };
  }

  const editorConfiguration = {
    extraPlugins: [MyCustomUploadAdapterPlugin],
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        'link',
        'bulletedList',
        'numberedList',
        '|',
        'outdent',
        'indent',
        '|',
        'imageUpload',
        'blockQuote',
        'insertTable',
        'mediaEmbed',
        'undo',
        'redo'
      ]
    },
    image: {
      toolbar: [
        'imageTextAlternative',
        'imageStyle:full',
        'imageStyle:side'
      ]
    },
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells'
      ]
    },
    language: 'en',
    placeholder: 'Мэдээний контент бичих...'
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <style>{`
        /* CKEditor Custom Styles */
        .ck-editor__editable {
          min-height: 500px !important;
          max-height: 700px;
        }
        
        .ck-editor__editable_inline {
          padding: 1.5rem !important;
        }
        
        .ck.ck-toolbar {
          border: none !important;
          border-bottom: 1px solid #e5e7eb !important;
          background: #f9fafb !important;
          padding: 0.75rem !important;
        }
        
        .ck-rounded-corners .ck.ck-editor__top .ck-sticky-panel .ck-toolbar {
          border-radius: 0 !important;
        }
        
        .ck-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .ck-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
        }
        
        .ck-content h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .ck-content p {
          margin-bottom: 1rem;
          line-height: 1.75;
        }
        
        .ck-content blockquote {
          border-left: 4px solid #ef4444;
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .ck-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          display: block;
        }
        
        .ck-content ul,
        .ck-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .ck-content li {
          margin-bottom: 0.5rem;
        }
        
        .ck-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5rem 0;
        }
        
        .ck-content table td,
        .ck-content table th {
          border: 1px solid #e5e7eb;
          padding: 0.75rem;
        }
        
        .ck-content table th {
          background: #f3f4f6;
          font-weight: 600;
        }
        
        .ck-content a {
          color: #ef4444;
          text-decoration: underline;
        }
        
        .ck-content a:hover {
          color: #dc2626;
        }
      `}</style>
      
      <CKEditor
        editor={ClassicEditor}
        data={value || ''}
        config={editorConfiguration}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        onReady={(editor) => {
          console.log('✅ CKEditor ready!', editor);
        }}
        onError={(error, { willEditorRestart }) => {
          console.error('❌ CKEditor error:', error);
        }}
      />
    </div>
  );
}