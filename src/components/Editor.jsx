// src/components/editor/TinyMCEEditor.jsx
import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function TinyMCEEditor({ value, onChange, height = 500 }) {
  const editorRef = useRef(null);

  return (
    <Editor
      apiKey="sl890g62bh10t80q6za9hiihczgedrq75rjglz6wyzp34itu" // Free version
      onInit={(evt, editor) => editorRef.current = editor}
      value={value}
      onEditorChange={onChange}
      init={{
        height: height,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
          'paste', // Word paste support
        ],
        toolbar: 
          'undo redo | blocks | bold italic forecolor backcolor | ' +
          'alignleft aligncenter alignright alignjustify | ' +
          'bullist numlist outdent indent | removeformat | help | ' +
          'link image media | code',
        content_style: 
          'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        
        // 🔥 WORD PASTE ТОХИРГОО
        paste_data_images: true,
        paste_as_text: false,
        paste_word_valid_elements: 'b,strong,i,em,h1,h2,h3,h4,h5,h6,p,ul,ol,li,a[href],span[style],blockquote',
        paste_retain_style_properties: 'color background-color font-size font-weight text-align',
        paste_merge_formats: true,
        
        // Automatic cleanup
        paste_preprocess: function(plugin, args) {
          console.log('Pasting content from Word...');
        },
        
        // Image upload
        images_upload_handler: async (blobInfo, progress) => {
          const formData = new FormData();
          formData.append('image', blobInfo.blob(), blobInfo.filename());

          try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/image`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            });

            const data = await response.json();
            
            if (data.success) {
              return data.data.url;
            } else {
              throw new Error(data.message || 'Upload failed');
            }
          } catch (error) {
            console.error('Image upload error:', error);
            throw error;
          }
        },
      }}
    />
  );
}