import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  AccessibilityHelp,
  Alignment,
  AutoLink,
  Autosave,
  Bold,
  BlockQuote,
  Code,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  HorizontalLine,
  Italic,
  Link,
  List,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SpecialCharacters,
  SpecialCharactersEssentials,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableToolbar,
  Underline,
  Undo,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  MediaEmbed,
  Indent,
  IndentBlock,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

// Custom Upload Adapter
class MyUploadAdapter {
  constructor(loader, uploadFunction) {
    this.loader = loader;
    this.uploadFunction = uploadFunction;
  }

  upload() {
    return this.loader.file.then(file => this.uploadFunction(file));
  }

  abort() {}
}

function MyCustomUploadAdapterPlugin(editor, uploadFunction) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader, uploadFunction);
  };
}

export default function Editor({ value, onChange, placeholder = "Контент бичих...", uploadImage }) {
  const editorConfig = {
    licenseKey: 'GPL', // 🔥 GPL License (үнэгүй)
    toolbar: {
      items: [
        'undo',
        'redo',
        '|',
        'heading',
        '|',
        'fontSize',
        'fontFamily',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'subscript',
        'superscript',
        'code',
        '|',
        'link',
        'insertImage',
        'mediaEmbed',
        'insertTable',
        'blockQuote',
        'horizontalLine',
        '|',
        'alignment',
        '|',
        'bulletedList',
        'numberedList',
        '|',
        'outdent',
        'indent',
        '|',
        'highlight',
        'specialCharacters',
        'removeFormat',
      ],
      shouldNotGroupWhenFull: false,
    },
    plugins: [
      AccessibilityHelp,
      Alignment,
      AutoLink,
      Autosave,
      Bold,
      BlockQuote,
      Code,
      Essentials,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      Heading,
      Highlight,
      HorizontalLine,
      Italic,
      Link,
      List,
      Paragraph,
      PasteFromOffice,
      RemoveFormat,
      SpecialCharacters,
      SpecialCharactersEssentials,
      Strikethrough,
      Subscript,
      Superscript,
      Table,
      TableToolbar,
      Underline,
      Undo,
      ImageBlock,
      ImageCaption,
      ImageInline,
      ImageInsert,
      ImageResize,
      ImageStyle,
      ImageToolbar,
      ImageUpload,
      MediaEmbed,
      Indent,
      IndentBlock,
    ],
    heading: {
      options: [
        {
          model: 'paragraph',
          title: 'Paragraph',
          class: 'ck-heading_paragraph',
        },
        {
          model: 'heading1',
          view: 'h1',
          title: 'Heading 1',
          class: 'ck-heading_heading1',
        },
        {
          model: 'heading2',
          view: 'h2',
          title: 'Heading 2',
          class: 'ck-heading_heading2',
        },
        {
          model: 'heading3',
          view: 'h3',
          title: 'Heading 3',
          class: 'ck-heading_heading3',
        },
        {
          model: 'heading4',
          view: 'h4',
          title: 'Heading 4',
          class: 'ck-heading_heading4',
        },
        {
          model: 'heading5',
          view: 'h5',
          title: 'Heading 5',
          class: 'ck-heading_heading5',
        },
        {
          model: 'heading6',
          view: 'h6',
          title: 'Heading 6',
          class: 'ck-heading_heading6',
        },
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