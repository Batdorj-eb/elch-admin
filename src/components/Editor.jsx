import { useEffect, useRef } from 'react';

export default function Editor({ value, onChange, placeholder = "Контент бичих...", uploadImage }) {
  const editorRef = useRef(null);
  const instanceRef = useRef(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Load CKEditor from CDN
    if (!window.CKEDITOR) {
      const script = document.createElement('script');
      script.src = 'https://cdn.ckeditor.com/ckeditor5/43.3.1/ckeditor5.umd.js';
      script.async = true;
      script.onload = () => initEditor();
      document.body.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.ckeditor.com/ckeditor5/43.3.1/ckeditor5.css';
      document.head.appendChild(link);
    } else {
      initEditor();
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy().catch(err => console.error(err));
        instanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (instanceRef.current && value !== instanceRef.current.getData()) {
      instanceRef.current.setData(value || '');
    }
  }, [value]);

  const initEditor = () => {
    if (!editorRef.current || instanceRef.current || isInitializedRef.current) return;
    if (!window.CKEDITOR) return;

    isInitializedRef.current = true;

    const {
      ClassicEditor,
      Essentials,
      Bold,
      Italic,
      Underline,
      Strikethrough,
      Subscript,
      Superscript,
      Code,
      Paragraph,
      Heading,
      Link,
      List,
      BlockQuote,
      Image,
      ImageCaption,
      ImageStyle,
      ImageToolbar,
      ImageUpload,
      ImageResize,
      MediaEmbed,
      Table,
      TableToolbar,
      Alignment,
      Undo,
      FontFamily,
      FontSize,
      FontColor,
      FontBackgroundColor,
      Highlight,
      RemoveFormat,
      HorizontalLine,
      SpecialCharacters,
      SpecialCharactersEssentials,
      PasteFromOffice,
      Indent,
      IndentBlock,
    } = window.CKEDITOR;

    // Custom Upload Adapter
    class UploadAdapter {
      constructor(loader) {
        this.loader = loader;
      }

      upload() {
        return this.loader.file.then(file => uploadImage(file));
      }

      abort() {}
    }

    function UploadAdapterPlugin(editor) {
      editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new UploadAdapter(loader);
      };
    }

    ClassicEditor
      .create(editorRef.current, {
        licenseKey: 'GPL',
        plugins: [
          Essentials,
          Bold,
          Italic,
          Underline,
          Strikethrough,
          Subscript,
          Superscript,
          Code,
          Paragraph,
          Heading,
          Link,
          List,
          BlockQuote,
          Image,
          ImageCaption,
          ImageStyle,
          ImageToolbar,
          ImageUpload,
          ImageResize,
          MediaEmbed,
          Table,
          TableToolbar,
          Alignment,
          Undo,
          FontFamily,
          FontSize,
          FontColor,
          FontBackgroundColor,
          Highlight,
          RemoveFormat,
          HorizontalLine,
          SpecialCharacters,
          SpecialCharactersEssentials,
          PasteFromOffice,
          Indent,
          IndentBlock,
        ],
        toolbar: [
          'undo', 'redo',
          '|',
          'heading',
          '|',
          'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
          '|',
          'bold', 'italic', 'underline', 'strikethrough',
          '|',
          'subscript', 'superscript', 'code',
          '|',
          'link', 'uploadImage', 'mediaEmbed', 'blockQuote',
          '|',
          'alignment',
          '|',
          'bulletedList', 'numberedList',
          '|',
          'outdent', 'indent',
          '|',
          'insertTable', 'horizontalLine', 'specialCharacters',
          '|',
          'highlight', 'removeFormat',
        ],
        heading: {
          options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
            { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
          ],
        },
        image: {
          toolbar: [
            'imageTextAlternative',
            '|',
            'imageStyle:inline',
            'imageStyle:wrapText',
            'imageStyle:breakText',
            '|',
            'resizeImage',
          ],
        },
        table: {
          contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
        },
        placeholder: placeholder,
        extraPlugins: uploadImage ? [UploadAdapterPlugin] : [],
      })
      .then(editor => {
        instanceRef.current = editor;
        editor.setData(value || '');
        editor.model.document.on('change:data', () => {
          const data = editor.getData();
          onChange(data);
        });
      })
      .catch(error => {
        console.error('CKEditor initialization error:', error);
        isInitializedRef.current = false;
      });
  };

  return (
    <div 
      ref={editorRef} 
      className="editor-container"
      style={{ minHeight: '400px' }}
    />
  );
}