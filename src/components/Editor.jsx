import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Bold,
  Essentials,
  Italic,
  Mention,
  Paragraph,
  Undo,
  Heading,
  Link,
  List,
  BlockQuote,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  MediaEmbed,
  Table,
  TableToolbar,
  Alignment,
  FontSize,
  FontFamily,
  FontColor,
  FontBackgroundColor,
  Strikethrough,
  Underline,
  Code,
  CodeBlock,
  HorizontalLine,
  Indent,
  IndentBlock,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

// Custom Upload Adapter for image uploads
class MyUploadAdapter {
  constructor(loader, uploadFunction) {
    this.loader = loader;
    this.uploadFunction = uploadFunction;
  }

  upload() {
    return this.loader.file.then(file => this.uploadFunction(file));
  }

  abort() {
    // Handle abort if needed
  }
}

function MyCustomUploadAdapterPlugin(editor, uploadFunction) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader, uploadFunction);
  };
}

export default function Editor({ value, onChange, placeholder = "Контент бичих...", uploadImage }) {
  const editorConfig = {
    toolbar: {
      items: [
        'undo', 'redo',
        '|',
        'heading',
        '|',
        'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
        '|',
        'bold', 'italic', 'underline', 'strikethrough',
        '|',
        'link', 'uploadImage', 'mediaEmbed', 'blockQuote', 'codeBlock',
        '|',
        'alignment',
        '|',
        'bulletedList', 'numberedList',
        '|',
        'indent', 'outdent',
        '|',
        'insertTable', 'horizontalLine',
      ],
    },
    plugins: [
      Bold,
      Essentials,
      Italic,
      Mention,
      Paragraph,
      Undo,
      Heading,
      Link,
      List,
      BlockQuote,
      Image,
      ImageCaption,
      ImageStyle,
      ImageToolbar,
      ImageUpload,
      MediaEmbed,
      Table,
      TableToolbar,
      Alignment,
      FontSize,
      FontFamily,
      FontColor,
      FontBackgroundColor,
      Strikethrough,
      Underline,
      Code,
      CodeBlock,
      HorizontalLine,
      Indent,
      IndentBlock,
    ],
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
      ],
    },
    image: {
      toolbar: [
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        '|',
        'toggleImageCaption',
        'imageTextAlternative',
      ],
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
    },
    placeholder: placeholder,
    extraPlugins: uploadImage ? [
      (editor) => MyCustomUploadAdapterPlugin(editor, uploadImage)
    ] : [],
  };

  return (
    <div className="editor-container">
      <CKEditor
        editor={ClassicEditor}
        config={editorConfig}
        data={value || ''}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
}